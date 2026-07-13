(() => {
  const STYLE_ID = 'tha-intake-subcategory-gold-outlines-styles';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Homeowner Quick Intake + Field Prep subcategory cards */
      .homeownerLane .tha-quick-card,
      .intakeLane .intakeSubsection{
        border-color:#e0b84d!important;
        box-shadow:0 0 0 2px rgba(224,184,77,.22),0 8px 18px rgba(23,62,87,.06)!important;
      }

      .homeownerLane .tha-quick-card:hover,
      .intakeLane .intakeSubsection:hover{
        border-color:#c99516!important;
        box-shadow:0 0 0 2px rgba(201,149,22,.30),0 10px 20px rgba(23,62,87,.08)!important;
      }

      .homeownerLane .tha-quick-card .tha-quick-header,
      .intakeLane .intakeSubsection>h3{
        border-bottom-color:rgba(224,184,77,.28)!important;
      }

      @media print{
        .homeownerLane .tha-quick-card,
        .intakeLane .intakeSubsection{
          box-shadow:none!important;
          border-color:#d8c07a!important;
        }
      }
    `;
    document.head.append(style);
  }

  function start() {
    installStyles();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();
