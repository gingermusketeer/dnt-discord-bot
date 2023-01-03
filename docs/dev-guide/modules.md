# Modules

Overview over all modules and dependencies.

```mermaid
flowchart BT

ActivityModule --> ActivityDatabaseModule
ActivityModule --> DbModule
BotModule --> ActivityDatabaseModule
BotModule --> DiscordModule
BotModule --> CabinModule
BotModule --> EmbedModule
CabinModule --> CabinDatabaseModule
CabinModule --> VisbookModule
CabinDatabaseModule --> CabinUtModule
CabinDatabaseModule --> DbModule
CabinUtModule --> VisbookModule
DiscordModule --> SlashCommandModule
NotificationModule --> DiscordModule
NotificationModule --> SubscriptionModule
NotificationModule --> ActivityModule
NotificationModule --> CabinModule
SlashCommandModule --> CabinModule
SlashCommandModule --> ChatCommandModule
SlashCommandModule --> EmbedModule
SlashCommandModule --> SubscriptionModule
SubscriptionModule --> DbModule
```
