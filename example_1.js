import { useRouter } from "next/router";
import { MainLayout } from "../../components/MainLayout";
import FastSearchWidget from "../../components/FastSearchWidget";
import { useEffect, useState, useRef, useMemo } from "react";
import ContentContainer from "../../components/ContentContainer";
import API from "../api";
import { Button } from "antd";
import Link from "next/link";
import { route } from "next/dist/next-server/server/router";
import Routes from "../routes";
import RoutePrevFW from "../../components/RoutePrevFW";
import { StickyContainer, Sticky } from "react-sticky";
import styles from "../../styles/[routeId].module.css";
import Map from "../../components/Map";
import Icon from "../../components/Icon";
import React from "react";
import Breadcrumbs from "../../components/Breadcrumbs.tsx";
import { Components } from "antd/lib/date-picker/generatePicker";
import { useIntl } from "react-intl";

// МЕНЮ ДНЕЙ МАРШРУТА ВТОРОГО УРОВНЯ
const Tab = ({ children, isActive, onClick }) => {
  return (
    <button className={isActive ? styles.active : ""} onClick={onClick}>
      {children}
    </button>
  );
};
const Panel = ({ children, isActive }) => {
  return isActive ? <div>{children}</div> : null;
};

function RouteDetails() {
  const { locale } = useRouter();

  const router = useRouter();

  const { formatMessage: f } = useIntl();

  const { routeId } = router.query;

  const [activeTab, setActiveTab] = useState("see");

  const [routes, setRoutes] = useState([]);
  const [days, setDays] = useState({});
  const [activeDayId, setActiveDayId] = useState();

  const [activePlace, setActivePlace] = useState({});

  const [activePoi, setActivePoi] = useState({});

  const seeRefs = useMemo(
    () =>
      activePlace?.see ? activePlace?.see.map(() => React.createRef()) : [],
    [activePlace]
  );
  const eatRefs = useMemo(
    () =>
      activePlace?.eat ? activePlace?.eat.map(() => React.createRef()) : [],
    [activePlace]
  );
  const stayRefs = useMemo(
    () =>
      days[activeDayId]?.stay
        ? days[activeDayId]?.stay.map(() => React.createRef())
        : [],
    [activePlace]
  );

  const scrollDummy = useRef(null);
  const scrollDummyFull = useRef(null);

  const getRoutes = async (params) => {
    const res = await API.getRoutes(params);
    setRoutes(res);
  };

  const getDay = async (dayId) => {
    const res = await API.getDay({ "filter[id]": dayId });
    console.log(API);
    setDays((prevState) => ({
      ...prevState,
      [dayId]: res.list && res.list[0],
    }));
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (scrollDummy.current && window) {
      scrollDummy.current.scrollIntoView();
      window.scrollBy(0, -180);
    }
  };

  useEffect(() => {
    if (routeId) getRoutes({ "filter[id]": routeId });
  }, [routeId, locale]);

  useEffect(() => {
    if (routes.list && routes.list[0] && routes.list[0].days) {
      setActiveDayId(routes.list[0].days[0]);
      routes.list[0].days.map((dayId) => {
        getDay(dayId);
      });
    }
  }, [routes, locale]);

  useEffect(() => {
    const thisDay = days[activeDayId];
    if (thisDay && thisDay.places) {
      setActivePlace(thisDay.places[0]);
    }
  }, [days, locale]);

  let mainmarkers = [];
  Object.values(days).map((day, dayIndex) => {
    if (!day) return;
    const { places } = day;
    if (places) {
      places.map((place) => {
        const marker = {
          isMain: true,
          id: place.id,
          name: place?.name?.text,
          position: {
            lng: place.location?.coordinates[1],
            lat: place.location?.coordinates[0],
          },
          isSelected: place.id === activePlace?.id,
          isActive: day.id === activeDayId,
          onClick: (e) => {
            setActiveDayId(day.id);
            setActivePlace(place);
          },
          dayIndex: routes.list[0].days.indexOf(day.id) + 1,
        };
        mainmarkers.push(marker);
      });
    }
  });

  let activeDayPlaceMarkers =
    days[activeDayId] && days[activeDayId].places
      ? days[activeDayId].places.map((place) => {
          return {
            id: place.id,
            name: place?.name?.text || "",
            isPlace: true,
            position: {
              lng: place.location?.coordinates[1],
              lat: place.location?.coordinates[0],
            },
            isSelected: place.id === activePlace?.id,
            isActive: true,
            onClick: (e) => {
              setActivePlace(place);
            },
          };
        })
      : [];

  let seemarkers = [];
  activePlace &&
    activePlace.see?.map((seepoint, i) => {
      const marker = {
        name: seepoint.name.text,
        id: seepoint.id,
        isPoi: true,
        position: {
          lng: seepoint.location.coordinates[1],
          lat: seepoint.location.coordinates[0],
        },
        isSelected: seepoint.id === activePoi?.id,
        onClick: () => {
          if (seeRefs[i]?.current) {
            seeRefs[i].current.scrollIntoView();
            window.scrollBy(0, -180);
          }
          setActivePoi(seepoint);
        },
      };
      seemarkers.push(marker);
    });

  let eatmarkers = [];
  activePlace &&
    activePlace.eat?.map((eatpoint, i) => {
      const marker = {
        name: eatpoint.name.text,
        id: eatpoint.id,
        isPoi: true,
        position: {
          lng: eatpoint.location.coordinates[1],
          lat: eatpoint.location.coordinates[0],
        },
        isSelected: eatpoint.id === activePoi?.id,
        onClick: () => {
          if (eatRefs[i]?.current) {
            eatRefs[i].current.scrollIntoView();
            window.scrollBy(0, -180);
          }
          setActivePoi(eatpoint);
        },
      };
      eatmarkers.push(marker);
    });

  let staymarkers = [];
  days &&
    days[activeDayId] &&
    days[activeDayId].stay.map((staypoint, i) => {
      const marker = {
        name: staypoint.name.text,
        id: staypoint.id,
        isPoi: true,
        position: {
          lng: staypoint.location.coordinates[1],
          lat: staypoint.location.coordinates[0],
        },
        isSelected: staypoint.id === activePoi?.id,
        onClick: () => {
          if (stayRefs[i]?.current) {
            stayRefs[i].current.scrollIntoView();
            window.scrollBy(0, -180);
          }
          setActivePoi(staypoint);
        },
      };
      staymarkers.push(marker);
    });

  // МЕНЮ ДНЕЙ МАРШРУТА ПЕРВОГО УРОВНЯ
  const DaysNav = () => (
    <div className={styles.daysNavigationBox}>
      {typeof routes === "object" &&
        routes.list &&
        routes.list[0] &&
        routes.list[0].days &&
        routes.list[0].days.map((dayId, i) => (
          <span
            className={
              activeDayId == dayId
                ? styles.daysNavigationActive
                : styles.daysNavigation
            }
            onClick={() => {
              setActiveDayId(dayId);
              if (days[dayId] && days[dayId].places)
                setActivePlace(days[dayId].places[0]);
              scrollDummyFull.current.scrollIntoView();
              window.scrollBy(0, -60);
            }}
            key={i}
          >
            {f({ id: "day" })} {i + 1}
          </span>
        ))}
    </div>
  );

  const copyToClipboard = (str) => {
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    const selected =
      document.getSelection().rangeCount > 0
        ? document.getSelection().getRangeAt(0)
        : false;
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
      alert("coordinates copied to clipboard");
    }
  };

  return (
    <MainLayout title={routes.list && routes.list[0]?.name?.text}>
      <FastSearchWidget route={routes && routes.list && routes.list[0]} />
      <Breadcrumbs />
      <div className={styles.routeMainMap}>
        <Map
          options={{
            center: mainmarkers && mainmarkers[0] && mainmarkers[0].position,
            zoom: 11,
          }}
          markers={mainmarkers}
        />
      </div>

      {typeof routes === "object" &&
        routes.list &&
        routes.list[0] &&
        routes.list[0].days &&
        routes.list[0].days.map(
          (dayId, i) =>
            activeDayId == dayId && (
              <div key={i}>
                <DaysNav />
                <div ref={scrollDummyFull}></div>
                <div className={styles.TabsNavbar}>
                  <Tab
                    isActive={activeTab === "see"}
                    onClick={() => {
                      handleTabClick("see");
                    }}
                  >
                    <span className={styles.tabsNav}>
                      <Icon icon="watch" active={activeTab === "see"} />
                      {f({ id: "see" })}
                      <div className={styles.separator}></div>
                    </span>
                  </Tab>
                  <Tab
                    isActive={activeTab === "eat"}
                    onClick={() => {
                      scrollDummy.current.scrollIntoView();
                      window.scrollBy(0, -180);
                      handleTabClick("eat");
                    }}
                  >
                    <span className={styles.tabsNav}>
                      <Icon icon="eat" active={activeTab === "eat"} />
                      {f({ id: "eat" })}
                      <div className={styles.separator}></div>
                    </span>
                  </Tab>
                  <Tab
                    isActive={activeTab === "stay"}
                    onClick={() => {
                      handleTabClick("stay");
                    }}
                  >
                    <span className={styles.tabsNav}>
                      <Icon icon="stay" active={activeTab === "stay"} />
                      {f({ id: "stay" })}
                      <div className={styles.separator}></div>
                    </span>
                  </Tab>
                  <Tab
                    isActive={activeTab === "trans"}
                    onClick={() => {
                      handleTabClick("trans");
                    }}
                  >
                    <span className={styles.tabsNav}>
                      <Icon icon="transport" active={activeTab === "trans"} />
                      {f({ id: "transport" })}
                    </span>
                  </Tab>
                </div>

                <div ref={scrollDummy}></div>

                <Panel isActive={activeTab === "see"}>
                  <ContentContainer>
                    {days &&
                      days[activeDayId] &&
                      days[activeDayId].places &&
                      typeof days === "object" && (
                        <>
                          <h2 className={styles.DayTitle}>
                            {activePlace.name?.text}
                          </h2>
                          <div
                            className={styles.DayDescription}
                            dangerouslySetInnerHTML={{
                              __html: activePlace.description?.text,
                            }}
                          />
                          <div className={styles.translationButtons}>
                            <span className={styles.button}>
                              {f({ id: "translate" })}
                            </span>
                            <span> / </span>
                            <span className={styles.button}>
                              {f({ id: "readOriginal" })}
                            </span>
                          </div>
                        </>
                      )}
                  </ContentContainer>
                  <ContentContainer className={styles.styckyContentContainer}>
                    <div className={styles.flexRow}>
                      <div className={styles.contentCol50p}>
                        {days &&
                          days[activeDayId] &&
                          days[activeDayId].places &&
                          typeof days === "object" &&
                          activePlace.see &&
                          activePlace.see.map((see, i) => (
                            <div
                              className={styles.contentItem}
                              key={i}
                              ref={seeRefs[i]}
                            >
                              <h3 className={styles.thrdtitle}>
                                <b>{see.name.text}</b>
                              </h3>
                              <img src={see.media} alt="" />
                              <div
                                className={styles.paragraph}
                                dangerouslySetInnerHTML={{
                                  __html: see.description.text,
                                }}
                              />
                              <span
                                onClick={() => {
                                  copyToClipboard(
                                    see.location.coordinates[1].toFixed(6) +
                                      "," +
                                      see.location.coordinates[0].toFixed(6)
                                  );
                                }}
                                className={styles.placeCoordinates}
                              >
                                <Icon icon="location" />
                                {see.location.coordinates[1].toFixed(6)},
                                {see.location.coordinates[0].toFixed(6)}
                              </span>
                              <div className={styles.hrLine}></div>
                            </div>
                          ))}
                      </div>
                      <div className={styles.contentCol50pSticky}>
                        <div id="mapBlock" className={styles.stickyMap}>
                          <div className={styles.stickyMapInner}>
                            <p className={styles.paragraph}>
                              <b>{f({ id: "locationsForDay" })}</b>
                              <br />
                              {days &&
                                activePlace.see &&
                                typeof days === "object" &&
                                activePlace.see.map((see, i) => (
                                  <span key={i}>
                                    {see.name.text} {" / "}
                                  </span>
                                ))}
                            </p>

                            <div className={styles.routeSecMap}>
                              <Map
                                options={{
                                  center:
                                    seemarkers &&
                                    seemarkers[0] &&
                                    seemarkers[0].position,
                                  zoom: 11,
                                }}
                                markers={[
                                  ...seemarkers,
                                  ...activeDayPlaceMarkers,
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ContentContainer>
                </Panel>

                <Panel isActive={activeTab === "eat"}>
                  <ContentContainer>
                    {days &&
                      days[activeDayId] &&
                      days[activeDayId].places &&
                      typeof days === "object" && (
                        <>
                          <h2 className={styles.DayTitle}>
                            {activePlace.name?.text}
                          </h2>
                          <div
                            className={styles.DayDescription}
                            dangerouslySetInnerHTML={{
                              __html: activePlace.description?.text,
                            }}
                          />
                          <div className={styles.translationButtons}>
                            <span className={styles.button}>Translate</span>
                            <span> / </span>
                            <span className={styles.button}>Read Original</span>
                          </div>
                        </>
                      )}
                  </ContentContainer>
                  <ContentContainer className={styles.styckyContentContainer}>
                    <div className={styles.flexRow}>
                      <div className={styles.contentCol50p}>
                        {days &&
                          days[activeDayId] &&
                          days[activeDayId].places &&
                          typeof days === "object" &&
                          activePlace.eat?.map((eat, i) => (
                            <div
                              className={styles.contentItem}
                              key={i}
                              ref={eatRefs[i]}
                            >
                              <h3 className={styles.thrdtitle}>
                                <b>{eat.name.text}</b>
                              </h3>
                              <img src={eat.media} alt="" />
                              <div
                                className={styles.paragraph}
                                dangerouslySetInnerHTML={{
                                  __html: eat.description.text,
                                }}
                              />
                              <p className={styles.paragraph}>
                                <b>Адрес:</b>
                                <br /> {eat.address}
                              </p>
                              <p className={styles.paragraph}>
                                <b>Контакты:</b>
                                <br /> {eat.contacts}
                              </p>
                              <span className={styles.placeCoordinates}>
                                <Icon icon="location" />
                                {eat.location.coordinates[1].toFixed(6)},
                                {eat.location.coordinates[0].toFixed(6)}
                              </span>
                              <div className={styles.hrLine}></div>
                            </div>
                          ))}
                      </div>
                      <div className={styles.contentCol50pSticky}>
                        <div className={styles.stickyMap}>
                          <div className={styles.stickyMapInner}>
                            <p className={styles.paragraph}>
                              <b>Локации на день:</b>
                              <br />
                              {days &&
                                activePlace.eat &&
                                typeof days === "object" &&
                                activePlace.eat.map((eat, i) => (
                                  <span key={i}>
                                    {eat.name.text} {" / "}
                                  </span>
                                ))}
                            </p>
                            <div className={styles.routeSecMap}>
                              <Map
                                options={{
                                  center:
                                    eatmarkers &&
                                    eatmarkers[0] &&
                                    eatmarkers[0].position,
                                  zoom: 11,
                                }}
                                markers={[
                                  ...eatmarkers,
                                  ...activeDayPlaceMarkers,
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ContentContainer>
                </Panel>

                <Panel isActive={activeTab === "stay"}>
                  <ContentContainer>
                    {days &&
                      days[activeDayId] &&
                      days[activeDayId].places &&
                      typeof days === "object" && (
                        <>
                          <h2 className={styles.DayTitle}>
                            {activePlace.name?.text}
                          </h2>
                          <div
                            className={styles.DayDescription}
                            dangerouslySetInnerHTML={{
                              __html: activePlace.description?.text,
                            }}
                          />
                          <div className={styles.translationButtons}>
                            <span className={styles.button}>Translate</span>
                            <span> / </span>
                            <span className={styles.button}>Read Original</span>
                          </div>
                        </>
                      )}
                  </ContentContainer>
                  <ContentContainer className={styles.styckyContentContainer}>
                    <div className={styles.flexRow}>
                      <div className={styles.contentCol50p}>
                        {days &&
                          days[activeDayId] &&
                          days[activeDayId].places &&
                          typeof days === "object" &&
                          days[activeDayId].stay.map((_stay, i) => (
                            <div
                              className={styles.contentItem}
                              key={i}
                              ref={seeRefs[i]}
                            >
                              <h3 className={styles.thrdtitle}>
                                <b>{days[activeDayId].stay[i].name.text}</b>
                              </h3>
                              <div
                                className={styles.paragraph}
                                dangerouslySetInnerHTML={{
                                  __html:
                                    days[activeDayId].stay[i].description.text,
                                }}
                              />
                              <p>
                                <b>Адрес:</b>
                                <br /> {days[activeDayId].stay[i].address}
                              </p>
                              <p className={styles.paragraph}>
                                <b>Контактная информация:</b>
                                <br /> {days[activeDayId].stay[i].contacts}
                              </p>
                              <span className={styles.placeCoordinates}>
                                <Icon icon="location" />
                                {days[activeDayId].stay[
                                  i
                                ].location.coordinates[1].toFixed(6)}
                                ,
                                {days[activeDayId].stay[
                                  i
                                ].location.coordinates[0].toFixed(6)}
                              </span>
                              <div className={styles.hrLine}></div>
                            </div>
                          ))}
                      </div>
                      <div className={styles.contentCol50pSticky}>
                        <div className={styles.stickyMap}>
                          <div className={styles.stickyMapInner}>
                            <p className={styles.paragraph}>
                              <b>Локации на день:</b>
                              <br />
                              {days &&
                                days[activeDayId] &&
                                days[activeDayId].places &&
                                typeof days === "object" &&
                                days[activeDayId].stay.map((_stay, i) => (
                                  <span key={i}>
                                    {days[activeDayId].stay[i].name.text}{" "}
                                    {" / "}
                                  </span>
                                ))}
                            </p>
                            <div className={styles.routeSecMap}>
                              <Map
                                options={{
                                  center:
                                    staymarkers &&
                                    staymarkers[0] &&
                                    staymarkers[0].position,
                                  zoom: 11,
                                }}
                                markers={[
                                  ...staymarkers,
                                  ...activeDayPlaceMarkers,
                                ]}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ContentContainer>
                </Panel>

                <Panel isActive={activeTab === "trans"}>
                  <ContentContainer>
                    <h1 className={styles.maintitle}>Общественный транспорт</h1>
                    <h2 className={styles.sectitle}>Район Los Remedios:</h2>
                    <p className={styles.paragraph}>
                      Улица Juan Sebastián Elcano и далее к мосту los Remedios,
                      а также на Avenida de Adolfo Suárez. До la Alameda de
                      Hércules
                      <br />
                      Автобус 06 (направление San Lazaro) с остановки Virgen de
                      Luján (Sebastián Elcano) до остановки Torneo (Puerta de
                      San Juan).
                      <br />
                      Автобус С3 (направление Barqueta) с остановки Génova
                      (Plaza de Cuba) до остановки Torneo (Puerta de San Juan).
                    </p>
                    <h2 className={styles.sectitle}>До центра Triana:</h2>
                    <p className={styles.paragraph}>
                      С1 Автобус (направление Cartuja) с остановки Virgen de
                      Luján (Sebastián Elcano) до остановки López de Gomara (San
                      Martín de Porres). <br />
                      05 Автобус (направление Puerta Triana) с остановки Eduardo
                      Dato (San Bernardo) до остановки López de Gomara (San
                      Martín de Porres). С3 Автобус (направление Barqueta){" "}
                      <br />с остановки Menéndez Pelayo (Juzgados) до остановки
                      Pagés del Corro (San Jacinto).
                    </p>
                  </ContentContainer>
                </Panel>
              </div>
            )
        )}
    </MainLayout>
  );
}

export default RouteDetails;
