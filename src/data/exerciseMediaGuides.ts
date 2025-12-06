export interface ExerciseMediaGuide {
  exerciseName: string;
  videoUrl?: string;
  imageUrl?: string;
  keyCues: string[];
  safetyTips: string[];
}

// Static mapping of common exercises with form guides
const exerciseGuides: ExerciseMediaGuide[] = [
  {
    exerciseName: "Squat",
    imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600",
    keyCues: [
      "Feet shoulder-width apart, toes slightly out",
      "Keep chest up and core braced",
      "Push knees out over toes as you descend",
      "Go as deep as mobility allows (ideally below parallel)",
      "Drive through heels to stand up"
    ],
    safetyTips: [
      "Never let knees cave inward",
      "Avoid rounding your lower back",
      "Start with lighter weight to master form"
    ]
  },
  {
    exerciseName: "Bench Press",
    imageUrl: "https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=600",
    keyCues: [
      "Grip bar slightly wider than shoulder-width",
      "Retract shoulder blades and arch upper back slightly",
      "Lower bar to mid-chest with control",
      "Press up in a slight arc back toward face",
      "Keep feet flat on floor for stability"
    ],
    safetyTips: [
      "Always use a spotter for heavy sets",
      "Don't bounce the bar off your chest",
      "Keep wrists straight, not bent back"
    ]
  },
  {
    exerciseName: "Deadlift",
    imageUrl: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=600",
    keyCues: [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Hinge at hips, grip bar just outside legs",
      "Keep back flat, chest up, shoulders over bar",
      "Drive through heels, push floor away",
      "Lock out by squeezing glutes at top"
    ],
    safetyTips: [
      "Never round your lower back",
      "Keep bar close to body throughout lift",
      "Don't hyperextend at the top"
    ]
  },
  {
    exerciseName: "Barbell Row",
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600",
    keyCues: [
      "Hinge forward to ~45 degree angle",
      "Keep core tight and back flat",
      "Pull bar toward lower chest/upper abs",
      "Squeeze shoulder blades at top",
      "Lower with control, don't swing"
    ],
    safetyTips: [
      "Don't use momentum to swing the weight",
      "Maintain neutral spine throughout",
      "Start lighter to feel the muscle working"
    ]
  },
  {
    exerciseName: "Overhead Press",
    imageUrl: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600",
    keyCues: [
      "Grip bar just outside shoulders",
      "Keep core tight, squeeze glutes",
      "Press bar straight up, moving head back slightly",
      "Lock out arms fully overhead",
      "Bring head through once bar passes"
    ],
    safetyTips: [
      "Don't arch your lower back excessively",
      "Keep elbows slightly in front of bar",
      "Use a weight you can control"
    ]
  },
  {
    exerciseName: "Pull-up",
    imageUrl: "https://images.unsplash.com/photo-1598971639058-a1c8a515cdae?w=600",
    keyCues: [
      "Grip bar slightly wider than shoulders",
      "Start from dead hang, shoulders engaged",
      "Pull elbows down and back",
      "Get chin over the bar",
      "Lower with control, full extension"
    ],
    safetyTips: [
      "Don't swing or kip unless intentional",
      "Engage shoulders before pulling",
      "Use assistance if needed to maintain form"
    ]
  },
  {
    exerciseName: "Push-up",
    imageUrl: "https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=600",
    keyCues: [
      "Hands slightly wider than shoulders",
      "Body in straight line from head to heels",
      "Lower chest to just above ground",
      "Keep elbows at ~45 degrees, not flared",
      "Push through palms to return"
    ],
    safetyTips: [
      "Don't let hips sag or pike up",
      "Keep core engaged throughout",
      "Scale to knees if needed to maintain form"
    ]
  },
  {
    exerciseName: "Lunges",
    imageUrl: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600",
    keyCues: [
      "Step forward with one leg",
      "Lower until both knees at 90 degrees",
      "Keep torso upright, core engaged",
      "Front knee tracks over toes",
      "Push through front heel to return"
    ],
    safetyTips: [
      "Don't let front knee go past toes excessively",
      "Avoid leaning forward",
      "Keep back knee from hitting ground hard"
    ]
  },
  {
    exerciseName: "Plank",
    imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600",
    keyCues: [
      "Forearms on ground, elbows under shoulders",
      "Body in straight line from head to heels",
      "Squeeze glutes and brace core",
      "Keep neck neutral, look at floor",
      "Breathe steadily, don't hold breath"
    ],
    safetyTips: [
      "Don't let hips sag or pike up",
      "Stop if lower back starts to ache",
      "Start with shorter holds and build up"
    ]
  },
  {
    exerciseName: "Dumbbell Curl",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600",
    keyCues: [
      "Stand tall, arms at sides, palms forward",
      "Keep elbows pinned to sides",
      "Curl weights up with control",
      "Squeeze biceps at the top",
      "Lower slowly, full extension"
    ],
    safetyTips: [
      "Don't swing or use momentum",
      "Keep shoulders back, not hunched",
      "Use appropriate weight for strict form"
    ]
  },
  {
    exerciseName: "Tricep Dips",
    imageUrl: "https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?w=600",
    keyCues: [
      "Hands on bench/bars, arms straight",
      "Lower body by bending elbows to ~90 degrees",
      "Keep elbows pointing back, not out",
      "Push through palms to return",
      "Keep chest up and shoulders down"
    ],
    safetyTips: [
      "Don't go too deep if shoulders feel strain",
      "Keep movements controlled",
      "Can bend knees to reduce load"
    ]
  },
  {
    exerciseName: "Leg Press",
    imageUrl: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600",
    keyCues: [
      "Feet shoulder-width on platform",
      "Keep lower back pressed against pad",
      "Lower until knees at ~90 degrees",
      "Push through heels, don't lock knees",
      "Control the weight, no bouncing"
    ],
    safetyTips: [
      "Never lock out knees fully",
      "Keep lower back flat on pad",
      "Don't go too heavy too soon"
    ]
  },
  {
    exerciseName: "Romanian Deadlift",
    imageUrl: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=600",
    keyCues: [
      "Hold bar/dumbbells in front of thighs",
      "Hinge at hips, push butt back",
      "Keep slight bend in knees throughout",
      "Lower until stretch in hamstrings",
      "Drive hips forward to return"
    ],
    safetyTips: [
      "Keep back flat, never round",
      "Bar/weights stay close to legs",
      "Don't go lower than hamstring flexibility allows"
    ]
  },
  {
    exerciseName: "Lat Pulldown",
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600",
    keyCues: [
      "Grip bar wide, lean back slightly",
      "Pull bar to upper chest",
      "Drive elbows down and back",
      "Squeeze lats at bottom",
      "Return with control, full stretch"
    ],
    safetyTips: [
      "Don't pull behind the neck",
      "Avoid excessive swinging",
      "Keep shoulders down, not shrugged"
    ]
  },
  {
    exerciseName: "Shoulder Press",
    imageUrl: "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600",
    keyCues: [
      "Dumbbells at shoulder height",
      "Press straight up, slight arc inward",
      "Lock out arms at top",
      "Lower with control to start",
      "Keep core braced throughout"
    ],
    safetyTips: [
      "Don't arch lower back excessively",
      "Keep neck neutral",
      "Start with lighter weight"
    ]
  }
];

// Normalize exercise name for matching
function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Get exercise media guide by name (fuzzy matching)
export function getExerciseMediaGuide(exerciseName: string): ExerciseMediaGuide | null {
  const normalized = normalizeExerciseName(exerciseName);
  
  // Try exact match first
  let guide = exerciseGuides.find(
    g => normalizeExerciseName(g.exerciseName) === normalized
  );
  
  // Try partial match
  if (!guide) {
    guide = exerciseGuides.find(
      g => normalized.includes(normalizeExerciseName(g.exerciseName)) ||
           normalizeExerciseName(g.exerciseName).includes(normalized)
    );
  }
  
  // Try matching keywords
  if (!guide) {
    const keywords = normalized.split(' ');
    guide = exerciseGuides.find(g => {
      const guideWords = normalizeExerciseName(g.exerciseName).split(' ');
      return keywords.some(kw => guideWords.some(gw => gw.includes(kw) || kw.includes(gw)));
    });
  }
  
  return guide || null;
}

export { exerciseGuides };
