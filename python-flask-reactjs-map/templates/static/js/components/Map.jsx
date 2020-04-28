
import React, { PureComponent } from 'react';

export class Map extends PureComponent {

    constructor (props) {
        super(props);

        this.state = { };
    }
    
    componentDidMount() {
        
        if (!this.state.map) {

            const map = new EVChargerMap('map', () => this.props.onMoveend());

            this.setState(state => ({
                map                 : map
            }));

            this.props.onCreated(map);
        }
    }

    render() {
        return <div id="map"></div>
    }
}


