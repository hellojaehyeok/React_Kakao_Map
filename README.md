# React_Kakao_Map 
React에서 KaKao Map 을 사용하며 정리한 Repository입니다.          

카카오에서 나온 sample들을 참고하였습니다.        
아래 주소에 나온 코드들은 Vanila Script, jQuery여서        
실제 프로젝트에는 React 방식대로 해석하여 코드를 작성하였습니다.        
https://apis.map.kakao.com/web/sample/        


# 기초 세팅 && map 생성
Kakao Map을 사용하기 위해서는 ./public/index.html에 아래 코드를 작성합니다.              

    <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey= -kakao key- &libraries=clusterer,services"></script>


map을 적용시킬 div를 생성한다. useRef를 이용하여 해당 div에 접근합니다.        
map의 경우 지도 유형 등을 바꿀 때 접근해야 하기 때문에 useState로 저장하여         
어디서든 사용할 수 있게 만들었습니다.        
useEffect를 사용하여 로드가 완료되면 카카오 지도를 만듭니다.        


    const [kakaoMap, setKakaoMap] = useState(null);
    const container = useRef();
    .
    .
    .
    // Map
    useEffect(() => {
        const script = document.createElement("script");
        script.src =
        "https://dapi.kakao.com/v2/maps/sdk.js?appkey= -kakao key- &libraries=services,clusterer,drawing&autoload=false";
        document.head.appendChild(script);

        script.onload = () => {
            kakao.maps.load(() => {
                const center = new kakao.maps.LatLng( 위도, 경도 )); // 처음 위치를 잡는다.
                const options = {
                center,
                level: 3  // 처음 줌 거리 낮을수록 줌인
                };
                const map = new kakao.maps.Map(container.current, options);  // container.current -> useRef를 통해 div 에 접근한다.
                setKakaoMap(map); // 생성한 map을 다른곳에서도 활용할 수 있게 state로 뺀다.
            });
        };
    }, [container]);

# Marker, Clusterer 생성 및 활용
마커란 지도에 위치를 표시할 수 있는 것이고        
클러스터러란 지도를 줌아웃 하였을 때 마커의 개수를 표시하는 것입니다.        

클러스터러는 map과 동일하게 여러 곳에서 사용하기 때문에  state로 빼줍니다.        
(excClusterer를 만들지 않은 이유는 따로 이용하는 곳이 없기 때문입니다.)        

    const [, setExcClusterer] = useState();

마커를 담는 배열입니다.        

    const [exclusiveArr, setExclusiveArr] = useState([]);

useEffect 등으로 배열에 좌표값을 담습니다.        
(서버에서 정보를 받아옵니다.)        

    setExclusiveArr(
      [ 
        new kakao.maps.LatLng(37.499590, 127.026374),
        new kakao.maps.LatLng(37.499427, 127.027947),
        ...                
      ]
    );


마커와 클러스터를 동시에 생성해 주는 함수를 만들어 코드를 간소화시킵니다.        
마커와 클러스터러는 여러 개 만들 수 있습니다.        
주석으로 추가 설명 이어가겠습니다.        

    const addMarkClust = (array, setClusterer, markerImg, clustererImg) => {

        // 마커가 들어있는 배열의 수가 0이면 만들어지지 않아야하기 때문에 return 시킵니다.
        if(array.length == 0){
            return;
        }

        // 마커 이미지를 생성하기 때문에 이미지의 사이즈와 옵션값을 선언합니다.
        var imageSize = new kakao.maps.Size(40, 40),
            imageOption = {offset: new kakao.maps.Point(4, 4)};
        var markerImage = new kakao.maps.MarkerImage(markerImg, imageSize, imageOption);

        // 클러스터러는 마커가 배열에 있어야지만 생성되기 때문에 빈 배열을 생성 후 map()을 통하여 push 합니다.
        let markers = [];
        array.map(item => {
            markers.push(
            new kakao.maps.Marker({
                map: kakaoMap, // 지도는 state로 만든 kakaoMap 을 사용합니다.
                position: new kakao.maps.LatLng(item.Ma, item.La), // 마커의 위치는 위에서 만든 좌표를 사용합니다.
                image: markerImage 
            })
            );
        })

        // 클러스터러를 선언합니다.
        var clusterer = new kakao.maps.MarkerClusterer({
            map: kakaoMap,  // 지도는 state로 만든 kakaoMap 을 사용합니다.
            averageCenter: true, // 마커의 중간점을 계산하여 클러스터러를 생성합니다.
            minLevel: 1,  //  최소 level 값을 설정합니다.
            disableClickZoom: true,  // 클러스터러를 클릭 시 자동으로 줌인되는것을 막습니다.
            calculator: [20, 50, 100],  // 마커의 개수별로 클러스터러 스타일을 달리하는데 그 기준을 잡습니다.
            styles:[  // calculator의 배열에 맞게 스타일을 잡습니다.
            {
                width : '50px', height : '50px',
                backgroundImage:  `url(${clustererImg})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                color: '#fff',
                textAlign: 'center',
                fontWeight: 'bold',
                lineHeight: '50px'
            },
            {
                width : '60px', height : '60px',
                backgroundImage:  `url(${clustererImg})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                color: '#fff',
                textAlign: 'center',
                fontWeight: 'bold',
                lineHeight: '60px'
            },
            {
                width : '94px', height : '94px',
                backgroundImage:  `url(${clustererImg})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                color: '#fff',
                textAlign: 'center',
                fontWeight: 'bold',
                lineHeight: '94px'
            }

            ]
        });
        // 클러스터러에 마커를 추가합니다.
        clusterer.addMarkers(markers);

        // 클러스터러를 클릭 하였을 때 클러스터러의 좌표값을 가져옵니다.
        // 해당 기능은 중심 좌표값을 활용하여 주변 건물 좌표를 가져오기 위해 만들었습니다.
        kakao.maps.event.addListener(clusterer, 'clusterclick', function(cluster) {
            setCenterClusterer({
            lat:cluster._center.toLatLng().Ma,
            lng:cluster._center.toLatLng().La
            })
        });

        // 클러스터러를 state로 만들어 줍니다.
        setClusterer(clusterer);
    }


이후 bool 타입 변수에 따라 마커를 생성/제거할 수 있습니다.        

    bool
    ?
    addMarkClust(exclusiveArr, setExcClusterer, exclusiveMarker, excClusterer) // 마커, 클러스터러 생성
    :
    setExcClusterer(clusterer=>{clusterer.clear(); return clusterer;}); // 마커, 클러스터러 지거 


# 지도 유형 바꾸기
일반, 위성, 지도, 거리 뷰에 대한 코드입니다.        
더 많은 유형은 카카오톡 샘플에 있습니다.        


redux를 활용하여 변수의 값을 변경하였습니다.        
useEffect 안에 switch 문을 이용하여 각각의 이벤트를 주었습니다.        


    // 지도의 타입을 초기화 시킨 후 변수에 따라 재적용 합니다.
    kakaoMap.removeOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
    kakaoMap.removeOverlayMapTypeId(kakao.maps.MapTypeId.USE_DISTRICT);
    .
    .
    .
    switch (mapRightRedux.mapStyle){
      case "roadmap":
        // 일반지도 입니다.
        kakaoMap.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);    
        break;
      case "district":
        // 지적지도 입니다.
        kakaoMap.addOverlayMapTypeId(kakao.maps.MapTypeId.USE_DISTRICT);
        break;
      case "hybrid":
        // 위성지도 입니다.
        kakaoMap.setMapTypeId(kakao.maps.MapTypeId.HYBRID);    
        break;
      case "roadView":
        // 로드뷰 지도 입니다.
        // 로드뷰에 관하여는 따로 챕터를 만들어 설명하겠습니다.
        kakao.maps.event.addListener(kakaoMap, 'click', clickHandler);
        const noRv = document.querySelector(".noRv");
        noRv.addEventListener("click", () => {
          kakao.maps.event.removeListener(kakaoMap, 'click', clickHandler);
          setRoadClusterer(clusterer=>{clusterer.clear(); return clusterer;})
        })
        kakaoMap.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
        break;
      default:
        kakaoMap.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);    
        break;
    }


# 로드뷰 및 이벤트 등록/삭제
로드뷰 지도를 이용하여 로드뷰를 생성하기 위해서는 div를 따로 생성하여야 합니다.        

    <RvWrapper className="rvWrapper">
        <RoadViewDiv className="roadview"></RoadViewDiv>
    </RvWrapper>

그 후 해당 div에 연결하여 로드뷰를 적용시킵니다.        


    if(mapRightRedux.mapStyle == "roadView"){
      var rvContainer = document.querySelector('.roadview'); //로드뷰를 표시할 div
      var rv = new kakao.maps.Roadview(rvContainer); //로드뷰 객체
      var rvClient = new kakao.maps.RoadviewClient();

      var markImage = new kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/roadview_minimap_wk_2018.png',
        new kakao.maps.Size(26, 46),
        {
            spriteSize: new kakao.maps.Size(1666, 168),
            spriteOrigin: new kakao.maps.Point(705, 114),
            offset: new kakao.maps.Point(13, 46)
        }
      );

      let markers = [];
      var rvMarker = new kakao.maps.Marker({
        image : markImage,
        draggable: true,
        map: kakaoMap,
        position: new kakao.maps.LatLng(37.511138, 126.997544)
      });
      
      markers.push(rvMarker);
      var clusterer = new kakao.maps.MarkerClusterer({
        map: kakaoMap,
        averageCenter: true, 
        minLevel: 1,
        disableClickZoom: true,
      });
      clusterer.addMarkers(markers);
      setRoadClusterer(clusterer);

      var clickHandler = function(mouseEvent) {    
        var position = mouseEvent.latLng; 
        rvMarker.setPosition(position);
        toggleRoadview(position);
      }; 

      function toggleRoadview(position){
        rvClient.getNearestPanoId(position, 50, function(panoId) {
            if (panoId === null) {
                rvContainer.style.display = 'none';
                rvWrapper.style.pointerEvents  = 'none';
                kakaoMap.relayout();
            } else {
                kakaoMap.relayout();
                rvContainer.style.display = 'block'; 
                rvWrapper.style.pointerEvents  = 'auto';
                rv.setPanoId(panoId, position);
                rv.relayout();
            }
        });
      }
    }
