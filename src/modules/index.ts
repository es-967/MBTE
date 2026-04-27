import { TrainingModule } from '../types/TrainingModule';
import { ScaleModule } from './ScaleModule';
import { TriadModule } from './TriadModule';
import { IntervalModule } from './IntervalModule';
import { StepModule } from './StepModule';
import { SeventhModule } from './SeventhModule';
import { FretboardStepModule } from './FretboardStepModule';
import { FretboardMajorScaleModule } from './FretboardMajorScaleModule';
import { FretboardIntervalModule } from './FretboardIntervalModule';
import { FretboardTriadModule } from './FretboardTriadModule';
import { FretboardSeventhModule } from './FretboardSeventhModule';

export const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'fretboard-seventh',
    title: '指板七和弦',
    description: '熟悉各大把位的七和弦指型，成為指板和弦大師',
    icon: '四',
    unlockLevel: 0,
    difficulty: 'advanced',
    category: 'fretboard',
    estimatedMinutes: 5,
    component: FretboardSeventhModule,
  },
  {
    id: 'fretboard-triad',
    title: '指板三和弦',
    description: '熟悉各大把位的三和弦指型，建立和弦與音階的視覺連結',
    icon: '弦',
    unlockLevel: 0,
    difficulty: 'intermediate',
    category: 'fretboard',
    estimatedMinutes: 5,
    component: FretboardTriadModule,
  },
  {
    id: 'scale-practice',
    title: '音階練習',
    description: '練習大調、小調各調性的音階組成，從基礎 C 大調到進階重升記號調性',
    icon: '🎼',
    unlockLevel: 0,
    difficulty: 'beginner',
    category: 'theory',
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
    category: 'theory',
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
    category: 'theory',
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
    category: 'theory',
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
    category: 'theory',
    estimatedMinutes: 7,
    component: SeventhModule,
  },
  {
    id: 'fretboard-step',
    title: '指板全半音練習',
    description: '在吉他指板上隨機挑選兩個音，挑戰判斷它們之間的距離是全音或半音',
    icon: '🎸',
    unlockLevel: 0,
    difficulty: 'beginner',
    category: 'fretboard',
    estimatedMinutes: 5,
    component: FretboardStepModule,
  },
  {
    id: 'fretboard-major-scale',
    title: '大調音階練習',
    description: 'CAGED 形狀記憶與推算，征服指板大調音階地圖',
    icon: '🗺️',
    unlockLevel: 0,
    difficulty: 'intermediate',
    category: 'fretboard',
    estimatedMinutes: 5,
    component: FretboardMajorScaleModule,
  },
  {
    id: 'fretboard-interval',
    title: '指板音程判斷',
    description: '在指板上推算與找出各個音程，強化相對音感',
    icon: '距',
    unlockLevel: 0,
    difficulty: 'intermediate',
    category: 'fretboard',
    estimatedMinutes: 5,
    component: FretboardIntervalModule,
  },
];
