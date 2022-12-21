import { Injectable } from '@nestjs/common';
import {
  CacheType,
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from 'discord.js';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { BaseCommand } from '../slashCommand.interface';

@Injectable()
export default class SubscribeCommand implements BaseCommand {
  public readonly name: string;
  public readonly slashCommandBuilder: RESTPostAPIApplicationCommandsJSONBody;

  constructor(private readonly subscriptionService: SubscriptionService) {
    this.name = 'subscribe';

    this.slashCommandBuilder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Subscribe for notifications.')

      .addSubcommandGroup((group) =>
        group
          .setName('channel')
          .setDescription('Subscribe the current channel.')
          .addSubcommand((subcommand) =>
            subcommand
              .setName('activities')
              .setDescription(
                `Subscribe the current channel to new activities.`,
              )
              .addStringOption((option) =>
                option
                  .setName('topic')
                  .setDescription(
                    `Choose your topic of interest, for example "klatring"`,
                  )
                  .setRequired(true),
              ),
          ),
      )

      .addSubcommand((subcommand) =>
        subcommand
          .setName('activities')
          .setDescription(`Get notified about new activities.`)
          .addStringOption((option) =>
            option
              .setName('topic')
              .setDescription(
                `Choose your topic of interest, for example "klatring"`,
              )
              .setRequired(true),
          ),
      )

      .addSubcommand((subcommand) =>
        subcommand
          .setName('cabins')
          .setDescription(`Get notified about new cabins.`),
      )
      .toJSON();
  }

  public async handleCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    const isAdded = await this.addSubscription(interaction);
    this.editReply(interaction, isAdded);
  }

  private async addSubscription(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<boolean> {
    const subscriber = this.getSubscriber(interaction);
    const subscription = {
      subscriberId: subscriber.id,
      subscriberType: subscriber.type,
      type: interaction.options.getSubcommand(),
      topic: interaction.options.getString('topic', false),
    };

    return await this.subscriptionService.add(subscription);
  }

  private getSubscriber(interaction: ChatInputCommandInteraction<CacheType>) {
    const type = interaction.options.getSubcommandGroup();
    if (type === null) {
      return { id: interaction.user.id, type: 'user' };
    }
    return { id: interaction.channelId, type: type };
  }

  private async editReply(
    interaction: ChatInputCommandInteraction<CacheType>,
    isAdded: boolean,
  ): Promise<void> {
    if (isAdded) {
      const subcommand = interaction.options.getSubcommand();

      let description;
      if (subcommand === 'cabins') {
        description = `new DNT cabins`;
      }

      if (subcommand === 'activities') {
        const topic = interaction.options.getString('topic', false);
        description = `new activities about "${topic}"`;
      }

      const subscriber = this.getSubscriber(interaction);
      let to;
      if (subscriber.type === 'user') {
        to = `You are`;
      }
      if (subscriber.type === 'channel') {
        to = `This channel is`;
      }

      const messageContent = `${to} now subscribed to ${description} and will receive notifications once daily.
This feature is under development, please contact an administrator if you want to unsubscribe.`;

      await interaction.editReply({ content: messageContent });
    } else {
      const messageContent = `Failed to subscribe, please try again later.`;
      await interaction.editReply({ content: messageContent });
    }
  }
}
