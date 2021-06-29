import React, { useEffect, useRef, useState } from 'react';

import styled from "styled-components"

import redMarker from '../img/redMarker.png';

const { kakao } = window;

const KakaoMap = (props) => {
    const container = useRef(); // 맵을 담을 ref 입니다.
    const [kakaoMap, setKakaoMap] = useState(null); // 카카오맵을 전역에서 쓸수있도록 만든 변수입니다.
    const [, setClusterer] = useState(); // 마커를 담는 클러스터러입니다. 
    const [markerArr, setMarkerArr] = useState([
        new kakao.maps.LatLng(37.499590, 127.026374),
        new kakao.maps.LatLng(37.499427, 127.027947),
    ]); // 마커들의 좌표데이터를 담는 변수입니다.  위 형태로 좌표를 넣으시면 됩니다.
    const [isMarker, setIsMarker] = useState(false); // 마커 클러스트러 상태 변수입니다.

    const [, setMyClusterer] = useState(); // 내 위치토글을 위해 만든 클러스터러입니다.
    const [isMy, setIsMy] = useState(false); // 내 위치 토글상태입니다. 

    // 로드뷰를 위해 만든 변수들입니다.
    const rvWrapperRef = useRef();
    const roadViewRef = useRef();
    const roadBtnRef = useRef();
    const [, setRoadClusterer] = useState();
    const [isRoadView, setIsRoadView] = useState(false);

    // 맵을 생성합니다.
    useEffect(() => {
        const center = new kakao.maps.LatLng( 37.496463, 127.029358); // 처음 위치를 잡습니다.
        const options = {
        center,
        level: 3  // 처음 줌 거리 낮을수록 줌인
        };
    
        const map = new kakao.maps.Map(container.current, options); 
        setKakaoMap(map); 
    }, [container]);

    // 클릭시 클러스터러의 중심좌표를 얻어옵니다.
    const setCenterClusterer = (clusterLocate) => {
        console.log(clusterLocate);
    }

    // 마커/클러스터러 토글
    const onClickMarkerToggle = () => {
        isMarker?
        setClusterer(clusterer=>{if(!clusterer){return clusterer}; clusterer.clear(); return clusterer;}) // 마커, 클러스터러 제거
        :
        addMarkClust(markerArr, setClusterer, redMarker, redMarker) // 마커, 클러스터러 추가
        
        setIsMarker(!isMarker);
    }

    // 마커/클러스터러를 만들어주는 함수입니다.
    // (좌표값이 들어있는배열, 클러스터러, 마커이미지, 클러스터러이미지)
    // 마커이미지, 클러스터러를 비워두면 기본 이미지가 나타납니다.
    const addMarkClust = (array, setClusterer, markerImg, clustererImg) => {
        // 마커가 들어있는 배열의 수가 0이면 만들어지지 않아야하기 때문에 return 시킵니다.
        if(array.length == 0){return;}

        // 이미지 사이즈 설정입니다.
        var imageSize = new kakao.maps.Size(20, 30),
            imageOption = {offset: new kakao.maps.Point(4, 4)};
        var markerImage = markerImg?new kakao.maps.MarkerImage(markerImg, imageSize, imageOption):null;
    
        // 클러스터러는 마커가 배열에 있어야지만 생성되기 때문에 빈 배열을 생성 후 map()을 통하여 push 합니다.
        // 하나의 마커를 토글 시키고 싶을 때는 클러스터러에 담고 토글 기능을 추가하면 됩니다. 
        let markers = [];
        array.map(item => {
            markers.push(
            new kakao.maps.Marker({
                map: kakaoMap, 
                position: new kakao.maps.LatLng(item.Ma, item.La),
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
            calculator: [1, 2, 100],  // 마커의 개수별로 클러스터러 스타일을 달리하는데 그 기준을 잡습니다.
            styles: clustererImg&& // calculator의 배열에 맞게 스타일을 잡습니다.
            [
                {
                    width:'45px', height:'70px',
                    backgroundImage: `url(${clustererImg})`, // 이미지에 형식에 맞게 넣으시면 됩니다.
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    color:"salmon",
                    display: "flex",
                    justifyContent:"center",
                    alignCenter:"center",
                },
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
    
        // 클러스터러를 state로 만들어 외부에서도 접근, 수정 가능하게 만들어줍니다.
        setClusterer(clusterer);
    }

    // 내 위치 토글 ( 오차범위 있습니다. )
   const onClickMy = () => {
        if(!isMy){
      
          // 마커의 토글을 위하여 클러스터러안에 마커를 담습니다.
          function displayMarker(locPosition) {
            let markers = [];
            var marker = new kakao.maps.Marker({  
                map: kakaoMap, 
                position: locPosition
            });
            markers.push(marker);
      
            var clusterer = new kakao.maps.MarkerClusterer({
              map: kakaoMap,
              averageCenter: true, 
              minLevel: 1,
              disableClickZoom: true,
            });
            clusterer.addMarkers(markers);
            setMyClusterer(clusterer);
            kakaoMap.setCenter(locPosition);      
          }
      
          // navigator.geolocation 속성이 있다면 조건문을 실행합니다.
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var lat = position.coords.latitude, // 위도
                    lon = position.coords.longitude; // 경도
                var locPosition = new kakao.maps.LatLng(lat, lon);
                displayMarker(locPosition);
              });
          }else{ 
            // 만약 브라우저가 geolocation 를 지원하지 않는다면 alert를 실행시킵니다.
            alert("navigator.geolocation 지원하지 않음")
          }
        }else{
            setMyClusterer(clusterer=>{ if(!clusterer){return} clusterer.clear(); return clusterer;})
        }
        setIsMy(!isMy);
    }

    // 로드맵 토글
    const onClickRoad = () => {

        if(!isRoadView){
            var rv = new kakao.maps.Roadview(roadViewRef.current); 
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

            // 토글기능을 위하여 클러스터러에다가 넣습니다.
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
                    roadViewRef.current.style.display = 'none';
                    rvWrapperRef.current.style.pointerEvents  = 'none';
                    kakaoMap.relayout();
                    } else {
                    kakaoMap.relayout();
                    roadViewRef.current.style.display = 'block'; 
                    rvWrapperRef.current.style.pointerEvents  = 'auto';
                    rv.setPanoId(panoId, position);
                    rv.relayout();
                    }
                });
            }

            kakao.maps.event.addListener(kakaoMap, 'click', clickHandler);
            roadBtnRef.current.addEventListener("click", () => {
            kakao.maps.event.removeListener(kakaoMap, 'click', clickHandler);
            setRoadClusterer(clusterer=>{clusterer.clear(); return clusterer;})
            })
            kakaoMap.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
        }else{
            kakaoMap.removeOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
            roadViewRef.current.style.display = 'none';
            rvWrapperRef.current.style.pointerEvents = 'none';
        }

        setIsRoadView(!isRoadView);

    }


    return(
        <Container>
            <KakaoMapContainer ref={container} />
            <TabWrap>
                <MarkerToggleBtn onClick={onClickMarkerToggle}>마커 클러스터러 토글</MarkerToggleBtn>
                <MarkerToggleBtn onClick={() => kakaoMap.setMapTypeId(kakao.maps.MapTypeId.ROADMAP) }>일반지도</MarkerToggleBtn>
                <MarkerToggleBtn onClick={() => kakaoMap.addOverlayMapTypeId(kakao.maps.MapTypeId.USE_DISTRICT) }>지적지도 on</MarkerToggleBtn>
                <MarkerToggleBtn onClick={() => kakaoMap.removeOverlayMapTypeId(kakao.maps.MapTypeId.USE_DISTRICT) }>지적지도 off</MarkerToggleBtn>
                <MarkerToggleBtn onClick={() => kakaoMap.setMapTypeId(kakao.maps.MapTypeId.HYBRID) }>위성지도</MarkerToggleBtn>
                <MarkerToggleBtn onClick={onClickRoad} ref={roadBtnRef}>로드뷰</MarkerToggleBtn>
                <MarkerToggleBtn onClick={() => kakaoMap.setLevel(kakaoMap.getLevel() - 1) }>줌인</MarkerToggleBtn>
                <MarkerToggleBtn onClick={() => kakaoMap.setLevel(kakaoMap.getLevel() + 1) }>줌아웃</MarkerToggleBtn>
                <MarkerToggleBtn onClick={onClickMy}>내위치</MarkerToggleBtn>

            </TabWrap>
            <RvWrapper ref={rvWrapperRef}>
                <RoadViewDiv ref={roadViewRef}></RoadViewDiv>
            </RvWrapper>
        </Container>
    )
};

export default KakaoMap;

// 지도를 표시하는 컴퍼넌트입니다.
// Container 사이즈 조절을 하시면 됩니다.
const Container = styled.div`
    position: relative;
    width:100vw;
    height:100vh;
`


// Style -----
const KakaoMapContainer = styled.div`
    width:100%;
    height:100%;
`
const TabWrap = styled.div`
    position: absolute;
    top:0px;
    right: 0px;
    z-index: 30;
    display: flex;
    flex-direction: column;
    background: #fff;
    width: 180px;
    padding: 20px;
    align-items: center;
`
const MarkerToggleBtn = styled.button`
    width: 150px;
    height: 50px;
    border:0;
    cursor: pointer;
    color: #454545;
    margin-bottom: 16px;
    border-radius: 32px;
    background: #ffffff;
    box-shadow:  17px 17px 34px #c2c2c2,
                -17px -17px 34px #ffffff;
`
const RvWrapper = styled.div`
  position:absolute;
  bottom:150px;
  left:22px;
  width:650px;
  height:350px;
  z-index:0;
  z-index: 99;
`

const RoadViewDiv = styled.div`
  width:100%;
  height:100%;
`
