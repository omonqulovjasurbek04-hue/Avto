import { PracticeService } from './practice.service';
export declare class PracticeController {
    private readonly practiceService;
    constructor(practiceService: PracticeService);
    checkAnswer(body: {
        questionId: string;
        answerId: string;
    }): Promise<{
        isCorrect: boolean;
        correctAnswerId: string | null;
        video: {
            playbackUrl: string;
            durationSec: number;
            type: import(".prisma/client").$Enums.VideoType;
        } | null;
        scene: import("../../common/utils/scene.util").SceneOutcome | null;
    }>;
}
