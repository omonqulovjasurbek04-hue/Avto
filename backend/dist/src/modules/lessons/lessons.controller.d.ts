import { LessonsService } from './lessons.service';
export declare class LessonsController {
    private readonly lessonsService;
    constructor(lessonsService: LessonsService);
    findAll(): import("./lessons.service").Lesson[];
    findOne(id: string): import("./lessons.service").Lesson;
}
