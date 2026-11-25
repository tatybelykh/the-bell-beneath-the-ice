"use strict";

const chapters = [
  {
    title: "The North Gate",
    key: "gate",
    next: "Go to the Hall of Records",
    lead: "Mara was here yesterday. The people near the gate know her well. Can they tell you where she went?",
    clues: [
      {
        id: "watchman",
        name: "Guard",
        position: [29, 63],
        mode: "tiles",
        context: "You ask the guard about Mara. He says nothing. Then you ask how he stays warm at night. He smiles.",
        before: "A simple question helped me",
        after: ".",
        prompt: "Tap the words in order to finish the sentence.",
        tiles: ["ice", "crack", "the", "break"],
        answer: "break the ice",
        hint: "Your question helps the guard start talking. Use three words. Start with break.",
        retry: "Start with break. What comes before ice?",
        idiom: "break the ice",
        meaning: "Help people feel more relaxed and start talking.",
        evidence: "The town book has a list of the people in Greywick. Mara saw that some names were missing. The guard gave her the key to the Hall of Records yesterday."
      },
      {
        id: "innkeeper",
        name: "Innkeeper",
        position: [71, 77],
        mode: "choice",
        context: "At the inn, a woman puts two cups on the table. One is for Mara.",
        quote: "The town leaders are giving Mara the cold shoulder. Other people are doing the same.",
        phrase: "giving Mara the cold shoulder",
        prompt: "What did people do to Mara?",
        choices: [
          "They asked her for help.",
          "They stopped saying hello to her.",
          "They invited her to stay."
        ],
        answer: 1,
        hint: "The town leaders were unfriendly to Mara.",
        retry: "Which answer shows that people don’t want to talk to her?",
        idiom: "give someone the cold shoulder",
        meaning: "Choose to be unfriendly to someone, often by ignoring them.",
        evidence: "Mara asked the town leaders about a missing name in the town book. After that, people stopped talking to her."
      },
      {
        id: "gate-log",
        name: "Guard’s notes",
        position: [72, 32],
        mode: "choice",
        context: "You read a line in the guard’s book.",
        quote: "Mara asked me about the steps under the bridge in the dead of winter. It was so cold that the river was frozen.",
        phrase: "in the dead of winter",
        prompt: "When did Mara ask about the steps?",
        choices: [
          "Before the first snow that year.",
          "After the gate closed at night.",
          "In the coldest part of winter."
        ],
        answer: 2,
        hint: "Think about the time of year.",
        retry: "How cold was it when Mara asked?",
        idiom: "in the dead of winter",
        meaning: "In the coldest part of winter.",
        evidence: "The guard drew a map. It shows steps that go down to the river."
      }
    ]
  },
  {
    title: "The Hall of Records",
    key: "archive",
    next: "Go under the river",
    lead: "This is where Greywick keeps its old books. Ivo works here. There are letters, a note and an open book on his desk.",
    clues: [
      {
        id: "requests",
        name: "A pile of letters",
        position: [30, 66],
        mode: "choice",
        context: "Ivo points to the letters on his desk.",
        quote: "I’m snowed under with work. I have so many letters to write and so many books to check.",
        phrase: "snowed under with work",
        prompt: "How can you help Ivo?",
        choices: [
          "Help him with the books.",
          "Clear the snow outside.",
          "Show him where the town leaders meet."
        ],
        answer: 0,
        hint: "Look at the things Ivo needs to do.",
        retry: "Which answer helps Ivo do his work?",
        idiom: "be snowed under with work",
        meaning: "Have too much work to do.",
        evidence: "There’s a letter from the town leaders in the pile. They want Ivo to put the old books in a locked room."
      },
      {
        id: "private-note",
        name: "Ivo’s note",
        position: [73, 35],
        mode: "type",
        context: "Ivo gives you a note. The town leaders are angry because he showed Mara the town book.",
        before: "One more mistake and I may lose my job. I’m already",
        after: " with the town leaders.",
        prompt: "Type the three missing words.",
        answer: "on thin ice",
        hint: "Ice can break if it is thin. The words start with o, t and i.",
        retry: "The last word is ice. Try o_ t___ i__.",
        idiom: "be on thin ice with someone",
        meaning: "Be in a situation where one more mistake can get you into trouble.",
        evidence: "Mara copied an old page about the bell. She put the copy in the open book."
      },
      {
        id: "ledger",
        name: "Old town book",
        position: [73, 77],
        mode: "choice",
        context: "A name is missing from last winter’s town book. There’s a note from Mara next to the empty space.",
        quote: "One missing name is just the tip of the iceberg.",
        phrase: "the tip of the iceberg",
        prompt: "What should you do next?",
        choices: [
          "Decide it’s just a mistake.",
          "Look for more missing names in older books.",
          "Find out how thick the ice is."
        ],
        answer: 1,
        hint: "Most of an iceberg is under water. You can only see a small part.",
        retry: "Mara thinks there may be more missing names.",
        idiom: "be the tip of the iceberg",
        meaning: "You can see only a small part of a much bigger problem.",
        evidence: "There are missing names in many books. Mara’s copy explains why. “To bring spring early, ring the bell and say a name. Everyone in town will forget that person.”"
      }
    ]
  },
  {
    title: "Under the River",
    key: "river",
    next: "Make your choice",
    lead: "You follow the steps under the ice. A huge bell hangs above the rocks. You see Mara beside a small light.",
    clues: [
      {
        id: "mara",
        name: "Mara’s lantern",
        position: [72, 68],
        mode: "choice",
        context: "Mara is holding a piece of metal from inside the bell. The bell can only ring with this piece in it.",
        quote: "The town leaders chose my name this year. I was ready to ring the bell. Then I got cold feet.",
        phrase: "got cold feet",
        prompt: "Why did Mara leave?",
        choices: [
          "She was too late to ring it.",
          "She didn’t know how to ring it.",
          "She was too afraid to ring it."
        ],
        answer: 2,
        hint: "Think about how Mara felt when it was time to ring the bell.",
        retry: "Mara planned to ring it. Then she felt afraid.",
        idiom: "get cold feet",
        meaning: "Suddenly feel too nervous to do something you planned.",
        evidence: "Mara took the metal piece and hid here. This stopped the town leaders from ringing the bell."
      },
      {
        id: "messenger",
        name: "Messenger",
        position: [30, 39],
        mode: "tiles",
        context: "A woman from the town hall comes down the steps. Most families have wood for ten more days. She wants you to ring the bell tonight.",
        before: "We need to",
        after: " until we tell the town about the bell.",
        prompt: "You want the town to wait. Tap the words in order.",
        tiles: ["on", "the plan", "ice", "into", "put"],
        answer: "put the plan on ice",
        hint: "Start with put. Put what? The last word is ice.",
        retry: "Put the plan after the verb. Use on before ice.",
        idiom: "put something on ice",
        meaning: "Stop a plan for now and come back to it later.",
        evidence: "The town leaders have extra wood. They can share it. No one knows how much longer winter will last."
      }
    ]
  }
];

const endings = {
  ring: {
    choice: "Ring the bell",
    consequence: "Spring comes early. The town forgets Mara.",
    title: "The price of spring",
    paragraphs: [
      "Before the sun comes up, the ice breaks. Water moves under the bridge again. The innkeeper takes Mara’s cup away. She can’t remember who it was for.",
      "Mara crosses the bridge and leaves town. You write her name in your own book. You still remember her."
    ]
  },
  wait: {
    choice: "Keep the bell silent",
    consequence: "Share the town’s extra wood. Everyone will remember Mara.",
    title: "The winter they chose",
    paragraphs: [
      "You take the old page to the town square and read it out loud. The leaders open the doors and share the wood. Mara and the guard take it to the coldest homes.",
      "The river is still frozen. People in Greywick must help each other until spring."
    ]
  }
};
