# Update Categories & Subcategories Structure

## Task Description

Replace current category structure with comprehensive Ukrainian categories list. This data is from a mature platform with proven task volumes and needs to be translated to Bulgarian, Russian, and English.

## Current State

We currently have a simplified category structure with 6 main categories and ~30 subcategories in `/src/features/categories/`.

## New Category Data (Ukrainian - To Be Translated)

### Main Categories with Task Counts:

1. **Домашний мастер** (Handyman) - 20,763 tasks
   - Сантехник (Plumber) - 2,691
   - Электрик (Electrician) - 2,781
   - Муж на час (Handyman) - 4,764
   - Столяр (Carpenter) - 1,989
   - Слесарь (Locksmith) - 1,439

2. **Ремонт техники** (Appliance Repair) - 184,417 tasks
   - Ремонт крупной бытовой техники - 31,359
   - Ремонт мелкой бытовой техники - 29,474
   - Компьютерная помощь - 26,678
   - Ремонт цифровой техники - 14,506
   - Ремонт мобильных телефонов - 10,372

3. **Отделочные работы** (Finishing Work) - 34,159 tasks
   - Ремонт квартир - 2,240
   - Укладка плитки - 1,681
   - Штукатурные работы - 1,698
   - Утепление помещений - 2,397
   - Монтаж отопления - 3,039

4. **Строительные работы** (Construction Work) - 35,744 tasks
   - Разнорабочие - 3,869
   - Сварочные работы - 1,749
   - Токарные работы - 438
   - Плотник - 963
   - Кладка кирпича - 1,143

5. **Мебельные работы** (Furniture Work) - 12,049 tasks
   - Изготовление мебели - 1,147
   - Ремонт мебели - 1,954
   - Сборка мебели - 2,544
   - Реставрация мебели - 1,080
   - Перетяжка мебели - 939

6. **Клининговые услуги** (Cleaning Services) - 35,347 tasks
   - Уборка квартир - 3,693
   - Генеральная уборка - 2,806
   - Уборка после ремонта - 2,978
   - Химчистка - 548
   - Уборка коттеджей и домов - 2,584

7. **Логистические и складские услуги** (Logistics) - 26,313 tasks
   - Грузоперевозки - 2,550
   - Услуги грузчиков - 3,379
   - Вывоз строительного мусора - 1,207
   - Перевозка мебели и техники - 2,447
   - Переезд квартиры или офиса - 2,375

8. **Бытовые услуги** (Household Services) - 20,364 tasks
   - Сад и огород - 3,282
   - Няни - 2,308
   - Услуги сиделки - 1,724
   - Услуги домработницы - 2,832
   - Услуги швеи - 705

9. **Ремонт авто** (Auto Repair) - 7,768 tasks
   - Помощь в дороге - 967
   - Техническое обслуживание и диагностика - 518
   - Автоэлектрика - 418
   - Кузовные работы - 417
   - Двигатель - 439

10. **Курьерские услуги** (Courier Services) - 122,542 tasks
    - Курьерская доставка - 9,682
    - Доставка продуктов - 9,273
    - Доставка готовой еды - 7,688
    - Доставка лекарств - 9,431
    - Курьер на авто - 7,487

11. **Digital Marketing** - 52,489 tasks
    - Настройка контекстной рекламы - 1,209
    - SEO оптимизация сайта - 187
    - Копирайтинг - 12,592
    - Продвижение в социальных сетях - 387
    - Email-маркетинг - 177

12. **AI услуги** (AI Services) - 3,156 tasks
    - Создание AI контента - 1,815
    - AI консалтинг - 259
    - Разработка на базе AI - 776
    - Аналитика данных с помощью AI - 306

13. **Другая реклама в Интернете** (Other Online Advertising) - 5,119 tasks
    - Размещение объявлений - 5,119

14. **Распространение рекламы** (Advertising Distribution) - 4,235 tasks
    - Раздача флаеров - 4,235
    - Расклейка объявлений - 4,235
    - Реклама в почтовые ящики - 4,235
    - Реклама в сэндвич-панеле - 4,235

15. **Дизайн** (Design) - 35,333 tasks
    - Разработка логотипов - 4,537
    - Дизайн интерьера - 1,420
    - Дизайн сайта и приложения - 2,544
    - Дизайн полиграфии - 2,879
    - Услуги печати - 1,816

16. **Услуги репетиторов** (Tutoring) - 30,215 tasks
    - Преподаватели по предметам - 7,108
    - Репетиторы иностранных языков - 4,596
    - Написание работ - 15,778
    - Преподаватели музыки - 936
    - Автоинструкторы - 1,155

17. **Разработка сайтов и приложений** (Web Development) - 20,973 tasks
    - Создание сайтов - 2,926
    - Доработка сайта - 2,476
    - Создание Landing page - 2,825
    - Верстка сайта - 1,743
    - Тестирование ПО (QA) - 922

18. **Работа в Интернете** (Online Work) - 95,314 tasks
    - Сбор, поиск информации - 14,628
    - Наполнение сайтов - 10,901
    - Набор текста - 21,499
    - Ввод данных - 14,813
    - Расшифровка интервью - 9,599

19. **Фото- и видео- услуги** (Photo/Video Services) - 12,945 tasks
    - Фотограф - 1,680
    - Видеооператор - 792
    - Обработка фотографий - 3,976
    - Монтаж видео - 2,659
    - Оцифровка видеокассет - 345

20. **Деловые услуги** (Business Services) - 8,960 tasks
    - Бухгалтерские услуги - 1,138
    - Юридические услуги - 1,040
    - Риэлтор - 521
    - Услуги колл-центра - 1,012
    - Финансовые услуги - 813

21. **Услуги для животных** (Pet Services) - 19,366 tasks
    - Уход за котами - 2,780
    - Уход за собаками - 2,822
    - Гостиница для животных - 1,550
    - Перевозка животных - 2,674
    - Уход за рыбками - 1,262

22. **Услуги красоты и здоровья** (Beauty & Health) - 4,911 tasks
    - Массаж - 630
    - Уход за ногтями - 483
    - Косметология - 213
    - Уход за ресницами - 218
    - Уход за бровями - 342

23. **Организация праздников** (Event Planning) - 7,746 tasks
    - Услуги ведущего - 512
    - Музыкальное сопровождение - 485
    - Услуги аниматоров - 721
    - Организация питания - 492
    - Выпечка и десерты - 651

24. **Бюро переводов** (Translation Services) - 21,596 tasks
    - Письменные переводы - 5,916
    - Редактура перевода - 3,410
    - Перевод документов и нотариальное заверение - 1,028
    - Устные переводы - 1,408
    - Технический перевод - 2,213

25. **Услуги тренеров** (Trainer Services) - 5,699 tasks
    - Йога - 597
    - Групповой фитнес - 746
    - Игровые виды спорта - 1,062
    - Водные виды спорта - 352
    - Боевые искусства - 870

26. **Волонтерская помощь** (Volunteer Help) - 65,405 tasks
    - Помощь пожилым людям - 9,300
    - Транспортные перевозки - 9,158
    - Доставка топлива - 9,111
    - Предоставление или поиск жилья - 9,089
    - Доставка еды - 9,308

## Requirements

- [ ] Create TypeScript data structure for all categories
- [ ] Translate all categories to Bulgarian (primary)
- [ ] Translate all categories to Russian
- [ ] Translate all categories to English
- [ ] Add appropriate emoji icons for each category
- [ ] Update `/src/features/categories/lib/data.ts`
- [ ] Update category selection component to handle expanded list
- [ ] Update database schema if category structure changes
- [ ] Create migration plan for existing tasks
- [ ] Update translation files (bg.ts, ru.ts, en.ts)

## Acceptance Criteria

- [ ] All ~26 main categories are defined
- [ ] All 100+ subcategories are defined with translations
- [ ] Category selection UI handles the expanded structure smoothly
- [ ] Emoji icons are assigned to each category
- [ ] All three languages (BG/RU/EN) have complete translations
- [ ] Existing functionality continues to work
- [ ] Search/filter works with new categories

## Technical Notes

### File Structure:
```
/src/features/categories/
├── lib/
│   ├── data.ts (main category definitions)
│   └── index.ts (exports)
└── index.ts
```

### Translation Keys Pattern:
```
categories.main.{mainCategoryId}.title
categories.main.{mainCategoryId}.description
categories.sub.{subcategorySlug}
```

### Considerations:
- Current structure has 6 main + ~30 subcategories
- New structure has 26 main + 100+ subcategories
- Need to maintain backward compatibility during migration
- Consider grouping similar categories for better UX
- May need pagination or infinite scroll in category selection
- Task counts can inform priority/popularity in UI

## Priority

**Medium** - This is a substantial improvement but not blocking core functionality. Should be done before launch to Bulgarian market.

## Estimated Effort

**Large** - 2-3 days
- Day 1: Structure data, translate to Bulgarian
- Day 2: Translate to Russian/English, add icons
- Day 3: Update UI, test, handle edge cases

## Notes

- Source data appears to be from a mature Ukrainian platform
- Task counts indicate real market demand
- Some categories like "Courier Services" (122k) and "Online Work" (95k) have very high demand
- Consider A/B testing new structure vs. current simplified one
- May want to hide less popular categories initially
