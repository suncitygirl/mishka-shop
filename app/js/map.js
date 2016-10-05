(function () {

  ymaps.ready(init);
  var myMap;

  function init() {
    myMap = new ymaps.Map("map", {
      center: [59.9363, 30.321132],
      zoom: [16],
      controls: []
    }),
    myMap.behaviors.disable("scrollZoom");
    myMap.controls.add("zoomControl");

    myPlacemark = new ymaps.Placemark([59.9363, 30.321132], {
      hintContent: "Санкт-Петербург, Невский проспект, д.20",
    }, {
      iconLayout: "default#image",
      iconImageHref: "../img/icon-map-pin.svg",
      iconImageSize: [37, 36],
    });
    myMap.geoObjects.add(myPlacemark);
  }
})();
