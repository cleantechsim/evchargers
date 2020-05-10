
import React, { PureComponent } from 'react';
import { EVChargerMap } from '../evchargermap';

export class MapProps {

    onMoveend: () => void;
    onCreated: (map: EVChargerMap) => void;

    debug: boolean;
}

class MapState {
    map : EVChargerMap;
}

export class Map extends PureComponent<MapProps, MapState> {

    constructor (props: MapProps) {
        super(props);

        this.state = { map: null };
    }
    
    componentDidMount() {
        
        if (!this.state.map) {

            const map: EVChargerMap = new EVChargerMap('map', () => this.props.onMoveend());

            this.setState(state => ({
                map : map
            }));

            this.props.onCreated(map);
        }
    }

    render() {
        return <div id="map"></div>
    }
}


