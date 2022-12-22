# Modules

Overview over all modules and dependencies.

```mermaid
flowchart BT

ActivityModule --> ActivityDatabaseModule
BotModule --> ActivityDatabaseModule
BotModule --> DiscordModule
BotModule --> CabinModule
BotModule --> EmbedModule
CabinModule --> CabinDatabaseModule
CabinModule --> VisbookModule
CabinDatabaseModule --> CabinUtModule
CabinUtModule --> VisbookModule
DiscordModule --> SlashCommandModule
NotificationModule --> DiscordModule
NotificationModule --> SubscriptionModule
SlashCommandModule --> CabinModule
SlashCommandModule --> ChatCommandModule
SlashCommandModule --> EmbedModule
SlashCommandModule --> SubscriptionModule
SubscriptionModule --> DbModule
```
