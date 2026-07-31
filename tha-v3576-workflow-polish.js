(() => {
  const ID = 'tha-v3576-workflow-polish-styles';
  if (document.getElementById(ID)) return;
  const style = document.createElement('style');
  style.id = ID;
  style.textContent = `
    .thaWorkflowSubsection>.controlGroup,
    .thaWorkflowSubsection>.sessionCard,
    .thaWorkflowSubsection>.intakeImportCard,
    .thaWorkflowSubsection>.businessRecordsCard{
      border:0!important;
      border-radius:0!important;
      background:transparent!important;
      padding:0!important;
      box-shadow:none!important;
    }
    .thaIdentitySubsection>.walkthroughSetupCard>.controlGroupTitle,
    .thaIdentitySubsection>.tha-walkthrough-setup-card>.controlGroupTitle,
    .thaWorkSessionSubsection>.localWorkCard>.controlGroupTitle{
      display:none!important;
    }
    .thaWorkSessionSubsection .tha-autosave-note{display:none!important}
    .thaInformationSourcesSubsection>.intakeImportCard>.intakeImportPanel>.intakeImportHeader{
      margin:0 0 7px!important;
      padding:0!important;
      border:0!important;
    }
    .thaRecordStorageSubsection>.businessRecordsCard>.driveSetupHeader{
      min-height:0!important;
      margin:0 0 8px!important;
      padding:0 0 8px!important;
    }
    .thaWorkflowPanel .walkthroughSetupCard label,
    .thaWorkflowPanel .tha-walkthrough-setup-card label{
      margin:0!important;
    }
  `;
  document.head.append(style);
})();
