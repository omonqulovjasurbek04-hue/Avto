import { Injectable, NotFoundException } from '@nestjs/common';

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

@Injectable()
export class LessonsService {
  private readonly lessons: Lesson[] = [
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

  findAll(): Lesson[] {
    return this.lessons;
  }

  findOne(id: string): Lesson {
    const lesson = this.lessons.find((l) => l.id === id);
    if (!lesson) throw new NotFoundException('Dars topilmadi');
    return lesson;
  }
}
