import { MATCH_CENTER_MAIN } from '../cypressConstants';

describe('Главная страница матч центра.', () => {
  it('Fetch новых данных должен быть по 18шт', () => {
    cy.server();
    cy.route('POST', '**/v4/leagues/**/relationships/matches', 'fx:mcFetchEventsByLeague.json', { status: 200 }).as('mcRout');
    cy.visit(MATCH_CENTER_MAIN, {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy=fetch-more-btn]')
      .first()
      .click();
    cy.wait('@mcRout').then((xhr) => {
      expect(xhr.request.body.includes('page%5Bsize%5D=18')).to.be.true; // eslint-disable-line
    });
    cy.contains('Локомотив');
    cy.contains('Манчестер Сити');
  });

  it('SSR main page render', () => {
    cy.visit(MATCH_CENTER_MAIN, {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy=mc-by-sport-block]');
    cy.get('[data-cy=sport-picker-name]');
  });

  it('SSR sport page render', () => {
    cy.visit('/matchi/ice-hockey', {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.contains('Расписание матчей по ХОККЕЮ');
    cy.get('[data-cy=event-card]').should('to.have.length.at.least', 1);
    cy.get('[data-cy=sport-picker-name]');
    cy.get('[data-cy=event-card-title').first().invoke('text').then((text) => {
      expect(text.length).not.eq(0);
    });
  });

  it('SSR league page render', () => {
    cy.visit('/matchi/ice-hockey/ligi/usa-nhl', {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy=sport-picker-name]');
    cy.get('.is-active');
    cy.get('[data-cy=sport-picker-name]');
    cy.get('[data-cy=event-card-title').first().invoke('text').then((text) => {
      expect(text.length).not.eq(0);
    });
    cy.get('[data-cy=event-row]').should('to.have.length.at.least', 1);
  });

  it('Заход по внутренней ссылке', () => {
    cy.visit('/novosti', {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.contains('матч-центр').click();
    cy.get('[data-cy=mc-by-sport-block]');
    cy.get('[data-cy=sport-picker-name]');
    cy.get('[data-cy=event-card-title').first().invoke('text').then((text) => {
      expect(text.length).not.eq(0);
    });
  });

  it('Смена вида спорта', () => {
    cy.visit('/matchi/ice-hockey', {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy=sport-picker-name]').first().click();
    cy.url().should('match', new RegExp('football'));
  });

  it('Смена активной лиги', () => {
    cy.visit('/matchi/ice-hockey', {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy=sport-picker-name]').first().click();
    cy.get('[data-cy=event-card-title').first().click();
    cy.url().should('match', new RegExp('ligi'));
    cy.get('[data-cy=event-row]').should('to.have.length.at.least', 1);
  });

  it('Смена лиги через модальное окно "Ещё лиги"', () => {
    cy.visit('/matchi/ice-hockey', {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy=league-picker-show-more]').click();
    cy.get('.mc-show-more__content').children().eq(1).click();
    cy.url().should('match', new RegExp('ligi'));
    cy.get('[data-cy=event-row]').should('to.have.length.at.least', 1);
  });

  it('Переход на страницу матча через карточку матча на мобильной версии', () => {
    cy.viewport('iphone-5');
    cy.visit('/matchi', {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy=mobile-event-card]').first().click({ force: true });
    cy.get('[data-cy=predictions-card]').should('to.have.length.at.least', 1);
  });

  // @TODO: Настроить мобильное отображение, переписать этот тест
  // it('Проверка работы компонента LazyLoad на модальном окне "Ещё лиги" на мобильном вьюпорте', () => {
  //   cy.viewport('iphone-5');
  //   cy.visit('/matchi/football', {
  //     auth: {
  //       username: Cypress.env('stageUserName'),
  //       password: Cypress.env('stagePwd'),
  //     },
  //   });
  //   cy.get('[data-cy=league-picker-show-more]').click();
  //   cy.wait(250);
  //   cy.get('.lazyload-placeholder').should('have.length', 75);
  //   cy.get('[data-cy=content-scroll]').scrollTo('bottom');
  //   cy.wait(100);
  //   cy.get('.lazyload-placeholder').should('not.have.length', 75);
  // });

  it('Проверка работы компонента LazyLoad на модальном окне "Ещё лиги"', () => {
    cy.visit('/matchi/football', {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy=league-picker-show-more]').click();
    cy.get('.lazyload-placeholder').should('to.have.length.at.least', 1);
    cy.get('[data-cy=desktop-league-piker-modal]').children().first().scrollTo('bottom', { easing: 'linear', duration: 1000 });
    cy.get('[data-cy=desktop-league-piker-modal]')
      .find('.lazyload-placeholder').should('have.length', 0);
  });

  it('Проверка правильного рендера карточек матчей desktop', () => {
    cy.server();
    cy.route('GET', '**/v4/sports/football/relationships/leagues**', 'fx:mcMain.json', { status: 200 });
    cy.route('GET', '**/v4/sports/tennis/relationships/leagues**', 'fx:mcMain.json', { status: 200 }).as('mc-tennis-data');

    cy.authVisit('/');
    cy.get('[data-cy=header-menu]')
      .contains('матч-центр')
      .click();
    cy.wait('@mc-tennis-data');
    cy.get('[data-cy=mc-forecast-desktop]')
      .first()
      .contains('9999');
    cy.get('[data-cy=event-row]')
      .first()
      .find('.mc-table__forecast-item')
      .contains('2.005');
    cy.get('[data-cy=event-row]')
      .first()
      .find('.mc-table__forecast-item')
      .contains('3.55');
    cy.get('[data-cy=event-row]')
      .first()
      .find('.mc-table__forecast-item')
      .contains('4.3');
  });

  it('Проверка запроса на фильтр по букмекерам', () => {
    const bookmakers = require('../fixtures/bookmakers.json');
    const routeConfig = {
      method: 'GET',
      url: '**/v4/sports/**',
      fixture: 'bookmakers.json',
      status: 200,
    };
    cy.server();
    cy.route(routeConfig).as('bookmakerName0');
    cy.visit(MATCH_CENTER_MAIN, {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy="bookmakers-select"]')
    .click();
    // Проверяем, чтобы были выбраны все букмекеры
    cy.wait('@bookmakerName0').then((xhr) => {
      expect(xhr.url.includes('filter[bookmakers]')).to.be.false;
    });
    // Сбрасываем XHR пойманный первым кликом на селект
    cy.route(routeConfig).as('bookmakerName1');
    cy.contains('Winline')
    .click();
    cy.wait('@bookmakerName1').then((xhr) => {
      expect(xhr.url.includes('filter[bookmakers]=4')).to.be.true;
      expect(bookmakers.data[3].id).to.deep.equal('4');
    });

    cy.route(routeConfig).as('bookmakerName2');
    cy.visit(MATCH_CENTER_MAIN, {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy="bookmakers-select"]')
    .click();
    // Проверяем, чтобы были выбраны все букмейкеры
    cy.wait('@bookmakerName2').then((xhr) => {
      expect(xhr.url.includes('filter[bookmakers]')).to.be.false;
    });
    // Сбрасываем XHR пойманный первым кликом на селект
    cy.route(routeConfig).as('bookmakerName3');
    cy.contains('1xСтавка')
    .click();
    cy.wait('@bookmakerName3').then((xhr) => {
      expect(xhr.url.includes('filter[bookmakers]=5')).to.be.true;
      expect(bookmakers.data[4].id).to.deep.equal('5');
    });

    cy.route(routeConfig).as('bookmakerName4');
    cy.visit(MATCH_CENTER_MAIN, {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy="bookmakers-select"]')
    .click();
    // Проверяем, чтобы были выбраны все букмейкеры
    cy.wait('@bookmakerName4').then((xhr) => {
      expect(xhr.url.includes('filter[bookmakers]')).to.be.false;
    });
    // Сбрасываем XHR пойманный первым кликом на селект
    cy.route(routeConfig).as('bookmakerName5');
    cy.contains('Лига Ставок')
    .click();
    cy.wait('@bookmakerName5').then((xhr) => {
      expect(xhr.url.includes('filter[bookmakers]=6')).to.be.true;
      expect(bookmakers.data[5].id).to.deep.equal('6');
    });

    cy.route(routeConfig).as('bookmakerName6');
    cy.visit(MATCH_CENTER_MAIN, {
      auth: {
        username: Cypress.env('stageUserName'),
        password: Cypress.env('stagePwd'),
      },
    });
    cy.get('[data-cy="bookmakers-select"]')
    .click();
    // Проверяем, чтобы были выбраны все букмейкеры
    cy.wait('@bookmakerName6').then((xhr) => {
      expect(xhr.url.includes('filter[bookmakers]')).to.be.false;
    });
    // Сбрасываем XHR пойманный первым кликом на селект
    cy.route(routeConfig).as('bookmakerName7');
    cy.contains('Леон')
    .click();
    cy.wait('@bookmakerName7').then((xhr) => {
      expect(xhr.url.includes('filter[bookmakers]=13')).to.be.true;
      expect(bookmakers.data[12].id).to.deep.equal('13');
    });
  });

  it('Проверка кнопки "Ещё лиги" с выбранным видом спорта', () => {
      const routeConfig = {
        method: 'GET',
        url: '**/v4/sports/**',
        status: 200,
      };
      cy.server();
      cy.route(routeConfig).as('moreLеagues0');
      cy.visit(`${MATCH_CENTER_MAIN }/football`, {
        auth: {
          username: Cypress.env('stageUserName'),
          password: Cypress.env('stagePwd'),
        },
      });
      cy.wait('@moreLеagues0').then((xhr) => {
        expect(xhr.url.includes('page[number]=1')).to.be.true;
      });

      cy.route(routeConfig).as('moreLеagues1');
      cy.get('[data-cy="moreLеagues"] > button')
      .click();
      cy.wait('@moreLеagues1').then((xhr) => {
        expect(xhr.url.includes('page[number]=2')).to.be.true;
      });
    });
});
