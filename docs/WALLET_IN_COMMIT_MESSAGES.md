# Wallet-Adresse in der Commit-Message

Neben [`.splitsettle.json`](../README.md#splitsettlejson--auto-wallet-configuration) kann jede Person eine **Ethereum-Adresse** direkt in einer **Commit-Message** hinterlegen. Beim nächsten **AI Invoice**-Lauf sucht SplitSettl im **gesamten Commit-Text** (Betreff + Body) der Commits **dieses Autors** nach der ersten gültigen Adresse (`0x` + 40 Hex-Zeichen, Checksumme wird normalisiert).

## Beispiel-Commit-Message

Eine Zeile reicht, z. B.:

```text
chore: SplitSettl demo — payout wallet 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

Oder kürzer:

```text
docs: register wallet 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

**Hinweis:** Verwende für echte Auszahlungen **deine eigenen** Adressen auf HashKey Chain (Testnet/Mainnet), nicht öffentliche Beispiel-Adressen aus dem Internet.

## Ablauf

1. Lokal committen und pushen (Branch, den du in SplitSettl analysierst, z. B. `main`).
2. Im SplitSettl-Frontend dieselbe Repo-URL + Branch wählen und analysieren.
3. Unter **Settle** sollte die Adresse aus der Message vorausgefüllt sein (zusammen mit `.splitsettle.json`, falls vorhanden — JSON hat Vorrang, wenn für denselben Login gesetzt).

## Technik

Die Erkennung läuft serverseitig in `/api/ai/analyze` und nutzt `ethers` (`isAddress` / `getAddress`).
