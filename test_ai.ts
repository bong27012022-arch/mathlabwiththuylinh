import { generateLearningPath } from './utils/aiGenerator';
import { UserProfile } from './types';

const user: UserProfile = {
  id: 'test-1',
  name: 'Test',
  grade: 11,
  proficiencyLevel: 2,
  numerologyNumber: 7
};

async function test() {
  console.log("Testing generateLearningPath...");
  try {
    const units = await generateLearningPath(user, ["Đại số", "Hình học"]);
    console.log(JSON.stringify(units, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
