export default (ctx) => {
  ctx.reply("Хорошо, сначала пришли мне текст");
  ctx.wizard.state.postData = {
    typograf: true,
    footer: true,
    instantView: true,
  };

  return ctx.wizard.next();
};
