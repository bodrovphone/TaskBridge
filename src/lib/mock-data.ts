// Shared mock data for tasks across the application
export const mockTasks = [
  {
    id: "1",
    title: "Разходка с кучето",
    description: "Търся надежден човек да разхожда кучето ми два пъти дневно в продължение на една седмица, докато съм в командировка. Кучето е голямо но много спокойно и се отнася добре към хората. Разходките трябва да са минимум по 30 минути всяка.",
    category: "personal_care",
    subcategory: "Разходка с куче",
    budgetMin: 15,
    budgetMax: 20,
    budgetType: "fixed",
    city: "София",
    neighborhood: "Лозенец",
    exactAddress: "ул. Околовръстен път 181",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    urgency: "within_week",
    requirements: "• Опит с големи кучета\n• Наличност всеки ден от 08:00-10:00 и 18:00-20:00\n• Възможност да изпраща снимки по време на разходката\n• Живее в района на Лозенец или близо до него",
    photos: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop&crop=center'
    ],
    status: "open",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applicationsCount: 8,
    customer: {
      firstName: "Мария",
      lastName: "Петрова",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b5e5?w=150&h=150&fit=crop&crop=face",
      averageRating: "4.8",
      totalReviews: 24,
      completedTasks: 18,
      memberSince: "2023-03-15"
    }
  },
  {
    id: "2",
    title: "Пренос на мебели",
    description: "Трябва ми помощ за преместване на мебели от Студентски град до Младост. Включва диван, маса, шкафове и кутии. Ще предоставя транспорт, но се нуждая от физическа помощ за товарене и разтоварване.",
    category: "delivery_transport",
    subcategory: "Транспорт и преместване",
    budgetMin: 80,
    budgetMax: 120,
    budgetType: "fixed",
    city: "София",
    neighborhood: "Студентски град",
    exactAddress: "бул. Христо Смирненски 15",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    urgency: "within_week",
    requirements: "• Физически силен човек\n• Опит с пренасяне на мебели\n• Наличност в събота от 9:00-17:00\n• Внимателно отношение към мебелите",
    photos: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop&crop=center'
    ],
    status: "open",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    applicationsCount: 12,
    customer: {
      firstName: "Георги",
      lastName: "Петров",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      averageRating: "5.0",
      totalReviews: 15,
      completedTasks: 15,
      memberSince: "2022-11-20"
    }
  },
  {
    id: "3",
    title: "Почистване на апартамент",
    description: "Професионално почистване на двустаен апартамент, включително прозорци и тераса. Площ около 75кв.м. Апартаментът е обитаем, но се нуждае от добро почистване преди идването на гости.",
    category: "home_repair",
    subcategory: "Почистване",
    budgetMin: 60,
    budgetMax: 80,
    budgetType: "fixed",
    city: "Пловдив",
    neighborhood: "Център",
    exactAddress: "ул. Главна 45",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    urgency: "flexible",
    requirements: "• Професионално почистващо оборудване\n• Опит с почистване на прозорци\n• Внимание към детайлите\n• Работа в делничен ден",
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center'
    ],
    status: "open",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applicationsCount: 6,
    customer: {
      firstName: "Елена",
      lastName: "Димитрова",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      averageRating: "4.5",
      totalReviews: 12,
      completedTasks: 9,
      memberSince: "2023-07-10"
    }
  },
  {
    id: "4",
    title: "Уроци по китара",
    description: "Търся преподавател по китара за начинаещ. Предпочитам индивидуални уроци, 2 пъти седмично. Имам собствена китара, но се нуждая от основни знания за свирене и четене на ноти.",
    category: "education_fitness",
    subcategory: "Музикални уроци",
    budgetMin: 25,
    budgetMax: 40,
    budgetType: "hourly",
    city: "София",
    neighborhood: "Витоша",
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    urgency: "flexible",
    requirements: "• Опит в преподаването на китара\n• Търпение с начинаещи\n• Възможност за домашни уроци\n• Гъвкаво разписание",
    photos: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center'
    ],
    status: "open",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applicationsCount: 4,
    customer: {
      firstName: "Николай",
      lastName: "Стоянов",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      averageRating: "4.9",
      totalReviews: 8,
      completedTasks: 7,
      memberSince: "2023-05-22"
    }
  },
  {
    id: "5",
    title: "Монтаж на климатик",
    description: "Нужен ми е майстор за монтаж на нов климатик. Климатикът вече е закупен, трябва само монтаж. Апартаментът е на втори етаж, има достъп до външната стена.",
    category: "home_repair",
    subcategory: "Електричество",
    budgetMin: 100,
    budgetMax: 150,
    budgetType: "fixed",
    city: "София",
    neighborhood: "Дружба",
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    urgency: "same_day",
    requirements: "• Лицензиран електротехник\n• Опит с монтаж на климатици\n• Собствени инструменти\n• Гаранция за работата",
    photos: [
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop&crop=center'
    ],
    status: "open",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    applicationsCount: 15,
    customer: {
      firstName: "Стефан",
      lastName: "Василев",
      profileImageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      averageRating: "4.7",
      totalReviews: 18,
      completedTasks: 14,
      memberSince: "2022-08-05"
    }
  },
  {
    id: "6",
    title: "Детегледачка за уикенда",
    description: "Търся отговорна детегледачка за двама деца (5 и 8 години) за събота и неделя от 14:00 до 20:00. Децата са спокойни и добре възпитани. Трябва да играете с тях и да ги нахраните вечеря.",
    category: "personal_care",
    subcategory: "Детегледане",
    budgetMin: 20,
    budgetMax: 30,
    budgetType: "hourly",
    city: "Варна",
    neighborhood: "Чайка",
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    urgency: "within_week",
    requirements: "• Опит с малки деца\n• Препоръки от предишни клиенти\n• Говори български език\n• Надежден и пунктуален",
    photos: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&h=600&fit=crop&crop=center'
    ],
    status: "open",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    applicationsCount: 9,
    customer: {
      firstName: "Десислава",
      lastName: "Янкова",
      profileImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      averageRating: "5.0",
      totalReviews: 22,
      completedTasks: 20,
      memberSince: "2021-12-03"
    }
  },
  {
    id: "7",
    title: "Ремонт на течаща чешма",
    description: "Спешно търся водопроводчик за ремонт на течаща чешма в кухнята. Капе постоянно и трябва смяна на уплътнението или цялата чешма. Имам достъп до всички инструменти.",
    category: "home_repair",
    subcategory: "Водопровод",
    budgetMin: 30,
    budgetMax: 50,
    budgetType: "fixed",
    city: "София",
    neighborhood: "Люлин",
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    urgency: "same_day",
    requirements: "• Лицензиран водопроводчик\n• Бързо и качествено изпълнение\n• Собствени материали\n• Наличност днес или утре",
    photos: [
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&h=600&fit=crop&crop=center'
    ],
    status: "open",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    applicationsCount: 7,
    customer: {
      firstName: "Петър",
      lastName: "Георгиев",
      profileImageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
      averageRating: "4.6",
      totalReviews: 11,
      completedTasks: 8,
      memberSince: "2023-01-18"
    }
  }
];

// Helper function to get a task by ID, or return the first task if ID not found
export function getTaskById(id: string) {
  return mockTasks.find(task => task.id === id) || mockTasks[0];
}

// Helper function to get similar tasks (excluding the current task)
export function getSimilarTasks(currentTaskId: string, limit: number = 3) {
  return mockTasks
    .filter(task => task.id !== currentTaskId)
    .slice(0, limit);
}