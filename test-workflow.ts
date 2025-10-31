import { mastra } from "./src/mastra/index";

/**
 * Test script for the course paper workflow
 *
 * This script tests the complete workflow for generating academic course papers
 * in different languages with various topics.
 */

async function testWorkflow() {
  console.log("🚀 Starting Course Paper Workflow Test...\n");

  // Test case 1: Uzbek language
  const uzbekTest = {
    topic: "Axborot xavfsizligini ta'minlashda DLP tizimlarining o'rni",
    language: "uzbek"
  };

  // Test case 2: English language
  const englishTest = {
    topic: "The Role of Artificial Intelligence in Modern Healthcare",
    language: "english"
  };

  // Test case 3: Russian language
  const russianTest = {
    topic: "Роль криптографии в обеспечении кибербезопасности",
    language: "russian"
  };

  try {
    console.log("📝 Test Case 1: Uzbek Language");
    console.log(`Topic: ${uzbekTest.topic}`);
    console.log(`Language: ${uzbekTest.language}\n`);

    const result = await mastra.workflows.writerWorkFlow.execute(uzbekTest);

    console.log("✅ Workflow executed successfully!");
    console.log("\n📊 Result Summary:");
    console.log(`- Name: ${result.name}`);
    console.log(`- Chapter Title: ${result.chapterTitle}`);
    console.log(`- Language: ${result.language}`);
    console.log(`- Number of Chapters: ${result.chapters.length}`);
    console.log(`- Has Introduction: ${!!result.introduction}`);
    console.log(`- Has Conclusion: ${!!result.conclusion}`);
    console.log(`- Has Bibliography: ${!!result.bibliography}`);
    console.log(`- Document Created: ${!!result.document}`);

    console.log("\n📚 Chapters:");
    result.chapters.forEach((chapter, index) => {
      console.log(`  ${index + 1}. ${chapter.chapterTitle}`);
      console.log(`     Sections: ${chapter.sections.length}`);
      chapter.sections.forEach((section, sIndex) => {
        console.log(`       ${sIndex + 1}. ${section.title}`);
        console.log(`          - Has Content: ${!!section.content}`);
        console.log(`          - Has Research Data: ${!!section.researchedDatas}`);
      });
    });

    console.log("\n📄 Document Output Preview:");
    console.log(result.document.substring(0, 500) + "...\n");

    // Uncomment to test other languages
    /*
    console.log("\n" + "=".repeat(80) + "\n");
    console.log("📝 Test Case 2: English Language");
    console.log(`Topic: ${englishTest.topic}`);
    console.log(`Language: ${englishTest.language}\n`);

    const englishResult = await mastra.workflows.writerWorkFlow.execute(englishTest);
    console.log("✅ English test completed successfully!\n");
    */

  } catch (error) {
    console.error("❌ Test failed with error:");
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testWorkflow().then(() => {
  console.log("\n🎉 All tests completed!");
  process.exit(0);
}).catch((error) => {
  console.error("\n💥 Fatal error:", error);
  process.exit(1);
});
