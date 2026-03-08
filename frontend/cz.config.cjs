module.exports = {
  allowBreakingChanges: ["feat", "fix"],

  allowCustomScopes: true,

  allowTicketNumber: false,
  isTicketNumberRequired: false,
  // it needs to match the value for field type. Eg.: 'fix'
  /*
      scopeOverrides: {
        fix: [

          {name: 'merge'},
          {name: 'style'},
          {name: 'e2eTest'},
          {name: 'unitTest'}
        ]
      },
      */
  // override the messages, defaults are as follows
  messages: {
    body: "Provide a LONGER description of the change (optional). Use \"|\" to break new line:\n",
    breaking: "List any BREAKING CHANGES (optional):\n",
    confirmCommit: "Are you sure you want to proceed with the commit above?",
    // used if allowCustomScopes is true
    customScope: "Denote the SCOPE of this change:",
    footer: "List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n",
    scope: "\nDenote the SCOPE of this change (optional):",
    subject: "Write a SHORT, IMPERATIVE tense description of the change:\n",
    type: "Select the type of change that you're committing:",
  },
  scopes: [
    { name: "api" },
    { name: "admin" },
    { name: "web" },
    { name: "database" },
    { name: "ci" },
    { name: "cd" },
    { name: "docker" },
    { name: "general" },
  ],
  // limit subject length
  subjectLimit: 100,

  ticketNumberPrefix: "TICKET-",

  ticketNumberRegExp: "\\d{1,5}",
  types: [
    { name: "✨ feat:\tAdding a new feature", value: ":sparkles: feat" },
    { name: "🐛 fix:\tFixing a bug", value: ":bug: fix" },
    { name: "📝 docs:\tAdd or update documentation", value: ":memo: docs" },
    {
      name: "💄 style:\tAdd or update styles, ui or ux",
      value: ":lipstick: style",
    },
    {
      name: "♻️ refactor:\tCode change that neither fixes a bug nor adds a feature",
      value: ":recycle: refactor",
    },
    {
      name: "⚡️ perf:\tCode change that improves performance",
      value: ":zap: perf",
    },
    {
      name: "✅ test:\tAdding tests cases",
      value: ":white_check_mark: test",
    },
    {
      name: "🚚 chore:\tChanges to the build process or auxiliary tools\n\t\tand libraries such as documentation generation",
      value: ":truck: chore",
    },
    { name: "⏪️ revert:\tRevert to a commit", value: ":rewind: revert" },
    { name: "🚧 wip:\tWork in progress", value: ":construction: wip" },
    {
      name: "👷 build:\tAdd or update regards to build process",
      value: ":construction_worker: build",
    },
    {
      name: "💚 ci:\tAdd or update regards to build process",
      value: ":green_heart: ci",
    },
  ],
  // skip any questions you want
  // skipQuestions: ['scope', 'body'],

  usePreparedCommit: false, // to re-use commit from ./.git/COMMIT_EDITMSG
  // breaklineChar: '|', // It is supported for fields body and footer.
  // footerPrefix : 'ISSUES CLOSED:'
  // askForBreakingChangeFirst : true, // default is false
}