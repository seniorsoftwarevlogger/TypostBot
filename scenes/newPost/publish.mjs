import { Telegraf } from "telegraf";
import { formatPost } from "./utils.mjs";

export default async (ctx) => {
  if (!ctx.message.text.match(/^(@.*)$/)) {
    await ctx.reply(
      `${ctx.message.text} не похоже на название канала.\nФормат: @channelname`
    );
    return;
  }

  const channelName = ctx.message.text;
  const channelsRef = await ctx.wizard.state.db
    .ref(`/users/${ctx.update.message.from.id}/channels/${channelName}`)
    .get();

  if (!channelsRef.exists()) {
    await ctx.reply("Сперва этот канал нужно добавить в бота: `/add_channel`");
    await ctx.deleteMessage(ctx.wizard.state.postData.id);
    return ctx.scene.leave();
  }

  const { text, entities, footer, typograf, instantView } =
    ctx.wizard.state.postData;

  const [postText, postEntities] = formatPost(
    text,
    entities,
    footer,
    typograf,
    instantView
  );

  const bot = new Telegraf(channelsRef.val().token, {});
  await bot.telegram.sendMessage(ctx.message.text, postText, {
    entities: postEntities,
  });
  await ctx.reply("Опубликовано.");

  return ctx.scene.leave();
};
