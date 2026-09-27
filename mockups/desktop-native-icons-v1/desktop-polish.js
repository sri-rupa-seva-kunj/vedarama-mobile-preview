// Keep the same controls and handlers when moving between a full chat and a book panel.
(() => {
 const heading=$('.inspector-tabs'),bar=$('.chat-model-bar');
 const actions=document.createElement('div');actions.className='native-chat-view-actions';
 bar.append(actions);
 function arrange(){
  const page=view==='ai'&&toolMode==='page'&&document.body.classList.contains('tool-page');
  const parent=page?actions:heading;
  for(const id of ['tool-mode','tool-close']){const node=$('#'+id);if(node.parentElement!==parent)parent.append(node);}
  heading.classList.toggle('native-chat-heading-hidden',page);
  actions.hidden=!page;
  drawIcons(parent);
 }
 const previousSync=syncNavigation;
 syncNavigation=function(){previousSync();arrange();};
 arrange();
})();
