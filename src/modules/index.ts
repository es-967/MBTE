import { TrainingModule } from '../types/TrainingModule';
import { ScaleModule } from './ScaleModule';
import { TriadModule } from './TriadModule';
import { IntervalModule } from './IntervalModule';
import { StepModule } from './StepModule';
import { SeventhModule } from './SeventhModule';

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'scale-practice',
    title: '音階練習',
    description: '練習大調、小調各調性的音階組成，從基礎 C 大調到進階重升記號調性',
    icon: '🎼',
    unlockLevel: 0,
    difficulty: 'beginner',
    estimatedMinutes: 5,
    component: ScaleModule,
  },
  {
    id: 'step-practice',
    title: '全音半音練習',
    description: '挑戰各個音名之間是全音或是半音，隨難度增加升降記號與距離',
    icon: '🎹',
    unlockLevel: 0,
    difficulty: 'beginner',
    estimatedMinutes: 5,
    component: StepModule,
  },
  {
    id: 'interval-practice',
    title: '音程判斷',
    description: '練習判斷兩個音之間的距離與性質（完全、大、小、增、減），提升音感',
    icon: '📏',
    unlockLevel: 0,
    difficulty: 'beginner',
    estimatedMinutes: 5,
    component: IntervalModule,
  },
  {
    id: 'triad-practice',
    title: '三和弦練習',
    description: '練習辨識大三、小三、增三、減三和弦，提升和弦聽覺與視覺辨識能力',
    icon: '🎸',
    unlockLevel: 0,
    difficulty: 'intermediate',
    estimatedMinutes: 5,
    component: TriadModule,
  },
  {
    id: 'seventh-practice',
    title: '七和弦練習',
    description: '練習辨識大七、屬七、小七、半減七、減七等進階和弦組成',
    icon: '🎷',
    unlockLevel: 0,
    difficulty: 'advanced',
    estimatedMinutes: 7,
    component: SeventhModule,
  },
];
