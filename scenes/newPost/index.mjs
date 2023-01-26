import { Scenes, Markup } from "telegraf";

import start from "./start.mjs";
import editPost from "./editPost.mjs";
import publish from "./publish.mjs";

const NEW_POST_WIZARD_ID = "newPostWizard";
const newPostWizard = new Scenes.WizardScene(
  NEW_POST_WIZARD_ID,
  start,
  editPost,
  publish
);

// Actions to control post parameters
const switchField = (field) => async (ctx) => {
  ctx.wizard.state.postData[field] = !ctx.wizard.state.postData[field];
  return ctx.wizard.steps[1](ctx);
};
newPostWizard.action("typograf", switchField("typograf"));
newPostWizard.action("footer", switchField("footer"));
newPostWizard.action("instantView", switchField("instantView"));

// Cancel publication
newPostWizard.action("cancel", async (ctx) => {
  await ctx.deleteMessage(ctx.wizard.state.postData.id);
  await ctx.reply("Публикация отменена.");
  ctx.scene.leave();
});

// Publish post
newPostWizard.action("publish", async (ctx) => {
  const channelsRef = await ctx.wizard.state.db
    .ref(`/users/${ctx.update.callback_query.from.id}/channels`)
    .get();

  if (!channelsRef.exists()) {
    await ctx.reply(
      "У вас нет каналов. Сперва канал нужно добавить в бота: `/add_channel`"
    );
    await ctx.deleteMessage(ctx.wizard.state.postData.id);
    return ctx.scene.leave();
  }

  const channels = Object.entries(channelsRef.val()).map(([ch, _token]) => ({
    text: ch,
  }));
  const keyboard = Markup.keyboard([channels]).oneTime();

  await ctx.reply("В какой канал отправляем?", keyboard);
});

export { NEW_POST_WIZARD_ID, newPostWizard };
