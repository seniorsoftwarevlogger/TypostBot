import { Markup } from "telegraf";
import { formatPost } from "./utils.mjs";

export default async (ctx) => {
  if (ctx.message) {
    ctx.wizard.state.postData.text = ctx.message.text;
    ctx.wizard.state.postData.entities = ctx.message.entities;
  }

  const { typograf, footer, instantView } = ctx.wizard.state.postData;
  const state = (field) => (field ? "✅" : "❌");
  const keyboard = [
    [
      Markup.button.callback(state(typograf) + " Типограф", "typograf"),
      Markup.button.callback(state(footer) + " Подвал", "footer"),
      Markup.button.callback(
        state(instantView) + " Быстрый вид",
        "instantView"
      ),
    ],
    [
      Markup.button.callback("Отменить", "cancel"),
      Markup.button.callback("Опубликовать", "publish"),
    ],
  ];

  const [text, entities] = formatPost(
    ctx.wizard.state.postData.text,
    ctx.wizard.state.postData.entities,
    footer,
    typograf,
    instantView
  );

  if (ctx.message) {
    const post = await ctx.reply(text, {
      entities: entities,
      reply_markup: { inline_keyboard: keyboard },
    });
    ctx.wizard.state.postData.id = post.message_id;
  } else {
    await ctx.editMessageText(text, {
      message_id: ctx.wizard.state.postData.id,
      entities: entities,
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  return ctx.wizard.next();
};
