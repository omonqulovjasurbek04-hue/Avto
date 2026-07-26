export interface LessonSection {
    heading: string;
    content: string;
    signs?: string[];
}
export interface Lesson {
    id: string;
    title: string;
    description: string;
    icon: string;
    readTime: string;
    ruleCode: string;
    sections: LessonSection[];
}
export declare class LessonsService {
    private readonly lessons;
    findAll(): Lesson[];
    findOne(id: string): Lesson;
}
