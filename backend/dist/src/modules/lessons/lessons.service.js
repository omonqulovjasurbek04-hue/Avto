"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonsService = void 0;
const common_1 = require("@nestjs/common");
let LessonsService = class LessonsService {
    lessons = [
        {
            id: 'lesson-1',
            title: "Chorrahalarda harakatlanish va ustunlik qoidalari",
            description: "Teng va teng bo'lmagan chorrahalardan o'tish tartiblari hamda svetofor signallariga rioya qilish.",
            icon: '🚦',
            readTime: '8 min',
            ruleCode: 'YHQ 13-band',
            sections: [
                {
                    heading: "Teng chorrahalarda harakatlanish",
                    content: "Teng imtiyozli chorrahada haydovchi o'ng tomondan yaqinlashib kelayotgan transport vositasiga yo'l berishi shart.",
                    signs: ['2.1', '2.4']
                },
                {
                    heading: "Asosiy va ikkinchi darajali yo'llar",
                    content: "Ikkinchi darajali yo'ldan chiqayotgan haydovchi asosiy yo'ldan kelayotgan barcha transport vositalariga yo'l berishi shart.",
                    signs: ['2.1', '2.5']
                }
            ]
        },
        {
            id: 'lesson-2',
            title: "Yo'l belgilari va chiziqlari",
            description: "Ogohlantiruvchi, imtiyoz, taqiqlovchi va buyuruvchi yo'l belgilarining ma'nolari.",
            icon: '🛑',
            readTime: '12 min',
            ruleCode: 'YHQ 5-band',
            sections: [
                {
                    heading: "Taqiqlovchi belgilar",
                    content: "Taqiqlovchi belgilar muayyan harakat cheklovlarini joriy etadi yoki bekor qiladi.",
                    signs: ['3.1', '3.2', '3.27']
                }
            ]
        },
        {
            id: 'lesson-3',
            title: "Piyodalar va jamoat transporti ustunligi",
            description: "Piyodalar o'tish joylarida va bekatlarda harakatlanish xavfsizligi qoidalari.",
            icon: '🚶',
            readTime: '6 min',
            ruleCode: 'YHQ 14-band',
            sections: [
                {
                    heading: "Tartibga solinmagan piyodalar o'tish joyi",
                    content: "Haydovchi tartibga solinmagan piyodalar o'tish joyiga yaqinlashganda, yo'lni kesib o'tayotgan piyodalarga yo'l berishi shart.",
                    signs: ['5.16.1', '5.16.2']
                }
            ]
        }
    ];
    findAll() {
        return this.lessons;
    }
    findOne(id) {
        const lesson = this.lessons.find((l) => l.id === id);
        if (!lesson)
            throw new common_1.NotFoundException('Dars topilmadi');
        return lesson;
    }
};
exports.LessonsService = LessonsService;
exports.LessonsService = LessonsService = __decorate([
    (0, common_1.Injectable)()
], LessonsService);
//# sourceMappingURL=lessons.service.js.map