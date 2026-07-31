(() => {
  const ID = 'tha-v35711-identity-full-width';
  if (window[ID]) return;
  window[ID] = true;

  function installStyles() {
    if (document.getElementById(`${ID}-styles`)) return;
    const style = document.createElement('style');
    style.id = `${ID}-styles`;
    style.textContent = `
      .thaIdentitySubsection > .walkthroughSetupCard,
      .thaIdentitySubsection > .tha-walkthrough-setup-card{
        display:grid!important;
        grid-template-columns:minmax(0,1fr)!important;
        grid-auto-flow:row!important;
        gap:10px!important;
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        align-items:stretch!important;
        justify-items:stretch!important;
      }
      .thaIdentitySubsection > .walkthroughSetupCard > label,
      .thaIdentitySubsection > .tha-walkthrough-setup-card > label{
        grid-column:1 / -1!important;
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        justify-self:stretch!important;
        align-self:stretch!important;
      }
      .thaIdentitySubsection > .walkthroughSetupCard > label > input,
      .thaIdentitySubsection > .tha-walkthrough-setup-card > label > input{
        display:block!important;
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
    `;
    document.head.append(style);
  }

  installStyles();
})();
