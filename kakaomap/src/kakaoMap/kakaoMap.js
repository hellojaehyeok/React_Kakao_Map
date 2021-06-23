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
    ]); // 마커들의 좌표데이터를 담는 변수입니다.
    const [isMarker, setIsMarker] = useState(false); // 마커 클러스트러 상태 변수입니다.

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

    // 마커/클러스터러 토글버튼 클릭 
    const onClickMarkerToggle = () => {
        isMarker?
        setClusterer(clusterer=>{if(!clusterer){return clusterer}; clusterer.clear(); return clusterer;}) // 마커, 클러스터러 제거
        :
        addMarkClust(markerArr, setClusterer, redMarker, redMarker) // 마커, 클러스터러 추가
        
        setIsMarker(!isMarker);
    }

    // 마커/클러스터러를 만드는 함수입니다.
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


    return(
        <Container>
            <KakaoMapContainer ref={container} />
            <TabWrap>
                <MarkerToggleBtn onClick={onClickMarkerToggle}>마커 클러스터러 토글</MarkerToggleBtn>
            </TabWrap>
        </Container>
    )
};

export default KakaoMap;

// 지도를 표시하는 컴퍼넌트입니다.
// KakaoMapContainer 사이즈 조절을 하시면 됩니다.
const KakaoMapContainer = styled.div`
  width:100vw;
  height:100vh;
`

// Style -----
const Container = styled.div`
    position: relative;
`
const TabWrap = styled.div`
    position: absolute;
    top:10px;
    right: 10px;
    z-index: 30;
`
const MarkerToggleBtn = styled.button`
    width: 150px;
    height: 50px;
    background-color: #fff;
    border:1px solid black;
    border-radius: 5px;
`