import { Telegraf, Scenes, session } from "telegraf";
import { fmt, link, code } from "telegraf/format";
import * as dotenv from "dotenv";
import firebaseAdmin from "firebase-admin";
import fs from "fs";
import { NEW_POST_WIZARD_ID, newPostWizard } from "./scenes/newPost/index.mjs";

dotenv.config();

const serviceAccount = fs.readFileSync(process.env.FIREBASE_CREDENTIALS);
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(JSON.parse(serviceAccount)),
  databaseURL: process.env.DATABASEURL,
  databaseAuthVariableOverride: {
    uid: process.env.AUTH_UID,
  },
});

const db = firebaseAdmin.database();

const bot = new Telegraf(process.env.BOT_TOKEN, {});

bot.use(session());
bot.use(new Scenes.Stage([newPostWizard]));
bot.use((ctx, next) => {
  ctx.state.db = db;
  return next();
});

await bot.telegram.setMyCommands([
  { command: "new_post", description: "Новый пост" },
  { command: "add_channel", description: "Добавить канал" },
  { command: "list_channels", description: "Список каналов" },
  {
    command: "add_instant_view",
    description: "Добавить код шаблона для Instant View",
  },
  {
    command: "list_instant_view",
    description: "Список шаблонов для Instant View",
  },
  { command: "add_footer", description: "Добавить подвал" },
  { command: "list_footers", description: "Список подвалов" },
]);

bot.start(async (ctx) => {
  const {
    text,
    entities,
  } = fmt`Привет! Я — бот-редактор. Типографлю тексты, добавляю подвал, оформляю ссылки на ваш сайт в ${link(
    "Instantview",
    "https://instantview.telegram.org/"
  )}. Для начала нужно сообщить название канала и токен бота для публикации ${code(
    "/add_channel @channelname bot_token"
  )}.`;
  ctx.reply(text, { entities });

  // Store user
  await ctx.state.db.ref(`/users/${ctx.update.message.from.id}`).set({
    chat_id: ctx.update.message.chat.id,
    username: ctx.update.message.from.username || "",
  });
});

bot.command("add_channel", async (ctx) => {
  const match = ctx.message.text.match(
    "/add_channel (?<channelname>@.*) (?<token>.*)"
  );

  if (match?.groups["channelname"] && match?.groups["token"]) {
    // Save Channel and token to Database
    await ctx.state.db
      .ref(
        `/users/${ctx.update.message.from.id}/channels/${match.groups["channelname"]}`
      )
      .set({
        token: match.groups["token"],
      });
  } else {
    ctx.reply(`Формат: \`/addchannel @channelname bot_token\``);
  }
});

bot.command("new_post", Scenes.Stage.enter(NEW_POST_WIZARD_ID, { db }));

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
