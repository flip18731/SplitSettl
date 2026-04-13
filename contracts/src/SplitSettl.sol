// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";

contract SplitSettl {
    struct Contributor {
        address addr;
        uint256 splitBps; // basis points, 10000 = 100%
        uint256 totalEarned;
        bool active;
    }

    struct Project {
        string name;
        address owner;
        uint256 contributorCount;
        uint256 totalPaid;
        uint256 createdAt;
        bool active;
    }

    struct Payment {
        uint256 amount;
        string invoiceRef;
        address token; // address(0) = native HSK
        uint256 timestamp;
        string hspRequestId;
    }

    enum HSPStatus { None, Requested, Confirmed, ReceiptGenerated }

    struct HSPMessage {
        uint256 projectId;
        uint256 amount;
        HSPStatus status;
        bytes32 txHash;
        uint256 requestedAt;
        uint256 confirmedAt;
        uint256 receiptAt;
    }

    // State
    uint256 public projectCount;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(uint256 => Contributor)) public projectContributors;
    mapping(uint256 => Payment[]) public projectPayments;
    mapping(address => uint256) public contributorTotalEarnings;
    mapping(string => HSPMessage) public hspMessages;
    mapping(address => uint256[]) public contributorProjects;

    // Events
    event ProjectCreated(uint256 indexed projectId, string name, address owner);
    event SplitsUpdated(uint256 indexed projectId);
    event ContributorAdded(uint256 indexed projectId, address contributor, uint256 splitBps);
    event PaymentSplit(uint256 indexed projectId, uint256 totalAmount, string invoiceRef);
    event ContributorPaid(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event HSPRequestCreated(uint256 indexed projectId, string hspRequestId, uint256 amount);
    event HSPConfirmed(uint256 indexed projectId, string hspRequestId);
    event HSPReceiptGenerated(uint256 indexed projectId, string hspRequestId, bytes32 txHash);

    modifier onlyProjectOwner(uint256 projectId) {
        require(projects[projectId].owner == msg.sender, "Not project owner");
        _;
    }

    modifier projectExists(uint256 projectId) {
        require(projects[projectId].active, "Project does not exist");
        _;
    }

    // ──────────────────────────────────────────────
    // Project Management
    // ──────────────────────────────────────────────

    function createProject(
        string calldata name,
        address[] calldata contributors,
        uint256[] calldata splitPercentages
    ) external returns (uint256) {
        require(contributors.length > 0, "Need at least one contributor");
        require(contributors.length == splitPercentages.length, "Array length mismatch");

        uint256 totalBps;
        for (uint256 i = 0; i < splitPercentages.length; i++) {
            totalBps += splitPercentages[i];
        }
        require(totalBps == 10000, "Splits must sum to 10000");

        uint256 projectId = projectCount++;
        projects[projectId] = Project({
            name: name,
            owner: msg.sender,
            contributorCount: contributors.length,
            totalPaid: 0,
            createdAt: block.timestamp,
            active: true
        });

        for (uint256 i = 0; i < contributors.length; i++) {
            projectContributors[projectId][i] = Contributor({
                addr: contributors[i],
                splitBps: splitPercentages[i],
                totalEarned: 0,
                active: true
            });
            contributorProjects[contributors[i]].push(projectId);
        }

        emit ProjectCreated(projectId, name, msg.sender);
        return projectId;
    }

    function updateSplits(
        uint256 projectId,
        uint256[] calldata newSplits
    ) external onlyProjectOwner(projectId) projectExists(projectId) {
        require(newSplits.length == projects[projectId].contributorCount, "Length mismatch");

        uint256 totalBps;
        for (uint256 i = 0; i < newSplits.length; i++) {
            totalBps += newSplits[i];
        }
        require(totalBps == 10000, "Splits must sum to 10000");

        for (uint256 i = 0; i < newSplits.length; i++) {
            projectContributors[projectId][i].splitBps = newSplits[i];
        }

        emit SplitsUpdated(projectId);
    }

    function addContributor(
        uint256 projectId,
        address contributor,
        uint256 splitBps
    ) external onlyProjectOwner(projectId) projectExists(projectId) {
        uint256 idx = projects[projectId].contributorCount;
        projectContributors[projectId][idx] = Contributor({
            addr: contributor,
            splitBps: splitBps,
            totalEarned: 0,
            active: true
        });
        projects[projectId].contributorCount++;
        contributorProjects[contributor].push(projectId);

        emit ContributorAdded(projectId, contributor, splitBps);
    }

    // ──────────────────────────────────────────────
    // Payment Processing
    // ──────────────────────────────────────────────

    function submitPayment(
        uint256 projectId,
        string calldata invoiceRef
    ) external payable projectExists(projectId) {
        require(msg.value > 0, "Must send HSK");
        _splitAndPay(projectId, msg.value, invoiceRef, address(0));
    }

    function submitPaymentERC20(
        uint256 projectId,
        address token,
        uint256 amount,
        string calldata invoiceRef
    ) external projectExists(projectId) {
        require(amount > 0, "Amount must be > 0");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        _splitAndPay(projectId, amount, invoiceRef, token);
    }

    function _splitAndPay(
        uint256 projectId,
        uint256 totalAmount,
        string calldata invoiceRef,
        address token
    ) internal {
        Project storage proj = projects[projectId];
        uint256 remaining = totalAmount;

        for (uint256 i = 0; i < proj.contributorCount; i++) {
            Contributor storage c = projectContributors[projectId][i];
            if (!c.active) continue;

            uint256 share;
            if (i == proj.contributorCount - 1) {
                share = remaining; // last contributor gets remainder to avoid dust
            } else {
                share = (totalAmount * c.splitBps) / 10000;
                remaining -= share;
            }

            if (token == address(0)) {
                (bool sent, ) = c.addr.call{value: share}("");
                require(sent, "HSK transfer failed");
            } else {
                IERC20(token).transfer(c.addr, share);
            }

            c.totalEarned += share;
            contributorTotalEarnings[c.addr] += share;

            emit ContributorPaid(projectId, c.addr, share);
        }

        proj.totalPaid += totalAmount;

        projectPayments[projectId].push(Payment({
            amount: totalAmount,
            invoiceRef: invoiceRef,
            token: token,
            timestamp: block.timestamp,
            hspRequestId: ""
        }));

        emit PaymentSplit(projectId, totalAmount, invoiceRef);
    }

    // ──────────────────────────────────────────────
    // HSP Message Tracking
    // ──────────────────────────────────────────────

    function emitPaymentRequest(
        uint256 projectId,
        uint256 amount,
        string calldata hspRequestId
    ) external projectExists(projectId) {
        hspMessages[hspRequestId] = HSPMessage({
            projectId: projectId,
            amount: amount,
            status: HSPStatus.Requested,
            txHash: bytes32(0),
            requestedAt: block.timestamp,
            confirmedAt: 0,
            receiptAt: 0
        });

        emit HSPRequestCreated(projectId, hspRequestId, amount);
    }

    function emitPaymentConfirmation(
        uint256 projectId,
        string calldata hspRequestId
    ) external projectExists(projectId) {
        require(hspMessages[hspRequestId].status == HSPStatus.Requested, "Not in Requested state");
        hspMessages[hspRequestId].status = HSPStatus.Confirmed;
        hspMessages[hspRequestId].confirmedAt = block.timestamp;

        emit HSPConfirmed(projectId, hspRequestId);
    }

    function emitPaymentReceipt(
        uint256 projectId,
        string calldata hspRequestId,
        bytes32 txHash
    ) external projectExists(projectId) {
        require(hspMessages[hspRequestId].status == HSPStatus.Confirmed, "Not in Confirmed state");
        hspMessages[hspRequestId].status = HSPStatus.ReceiptGenerated;
        hspMessages[hspRequestId].txHash = txHash;
        hspMessages[hspRequestId].receiptAt = block.timestamp;

        emit HSPReceiptGenerated(projectId, hspRequestId, txHash);
    }

    // ──────────────────────────────────────────────
    // View Functions
    // ──────────────────────────────────────────────

    function getProject(uint256 projectId) external view returns (
        string memory name,
        address owner,
        uint256 contributorCount,
        uint256 totalPaid,
        uint256 createdAt,
        bool active
    ) {
        Project storage p = projects[projectId];
        return (p.name, p.owner, p.contributorCount, p.totalPaid, p.createdAt, p.active);
    }

    function getProjectContributors(uint256 projectId) external view returns (
        address[] memory addrs,
        uint256[] memory splits,
        uint256[] memory earnings
    ) {
        uint256 count = projects[projectId].contributorCount;
        addrs = new address[](count);
        splits = new uint256[](count);
        earnings = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            Contributor storage c = projectContributors[projectId][i];
            addrs[i] = c.addr;
            splits[i] = c.splitBps;
            earnings[i] = c.totalEarned;
        }
    }

    function getContributorEarnings(address contributor) external view returns (uint256) {
        return contributorTotalEarnings[contributor];
    }

    function getProjectPaymentHistory(uint256 projectId) external view returns (Payment[] memory) {
        return projectPayments[projectId];
    }

    function getProjectPaymentCount(uint256 projectId) external view returns (uint256) {
        return projectPayments[projectId].length;
    }

    function getHSPStatus(string calldata hspRequestId) external view returns (
        uint256 projectId,
        uint256 amount,
        HSPStatus status,
        bytes32 txHash,
        uint256 requestedAt,
        uint256 confirmedAt,
        uint256 receiptAt
    ) {
        HSPMessage storage m = hspMessages[hspRequestId];
        return (m.projectId, m.amount, m.status, m.txHash, m.requestedAt, m.confirmedAt, m.receiptAt);
    }

    receive() external payable {}
}
