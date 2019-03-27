//const emitter = require('./EventBus');
import usb from 'usb';

const EventEmitter = require('events');

export default class RemoteCtrl extends EventEmitter {

    constructor() {
        super();
        this.setupRemotes();
        let lights = [0x00,0x00,0x00,0x00];
        this.lights = lights;
        this.setAllLightsOn();
        setTimeout(() => {
            this.setAllLightsOff();
        }, 5000);   
    }


    // -------------- CONNECTION ----------------- //

    // PUBLIC
    // Opens connection to receive data from remotes
    startPolling () {
        if(this.device.interfaces[0].endpoints[0].pollActive){
            console.log('[RMT] Polling already active...');
            return;
        }
        try {
            console.log('[RMT] Setting endpoint to polling mode...');
            this.device.interfaces[0].endpoints[0].startPoll(1,8);
        } catch (e) {
            console.log('[RMT] Cannot set endpoint to polling mode: ', e);
            try {
                this.device.close();
            } catch (e) {
                console.log('[RMT] Cannot close device: ', e);  
            }
        } 
        
        // Wait for event : read
        this.device.interfaces[0].endpoints[0].on("data", (dataBuf) => {
            this.handleEvent(this,dataBuf, this.device.interfaces[0].endpoints[0]);
        })
    }

    // PUBLIC
    // Stop polling - set close to true if want to close connection after stop polling
    stopPoll (close=false) {
        console.log('[RMT] Stopping polling mode...');
        try {
            this.device.interfaces[0].endpoints[0].stopPoll(
                () => console.log('[RMT] Stopped polling mode')
            );
        } catch (e) {
            console.log('[RMT] Error stopping polling: ', e);  
        }    
    }

    // PUBLIC
    // Closes connection with remotes
    close () {
        try {
            this.device.close()
            console.log("[RMT] Device closed");
        } catch (e) {
            console.log('[RMT] Error closing device: ', e);  
        }
    }

    // -------------- SEND DATA ----------------- //

    // PRIVATE
    // Sends dataBuffer to remotes
    write(dataBuffer){
        //bmRequestType, bmRequest, wValue and wIndex
        //ctrl_transfer(0x21, 0x09, 0x0200,0,[0x0,self.lights[0],self.lights[1],self.lights[2],self.lights[3],0x0,0x0])

        // Write
        console.log('[RMT] Sending dataBuffer', dataBuffer);
        try {
            this.device.controlTransfer(0x21, 0x09, 0x0200, 0, dataBuffer, function(error, data) {
                if(error)
                    console.log(error, data); 
            })
        } catch (error) {
            console.log('error', error);
        }
    }

    // -------------- LIGHTS ----------------- //

    // PUBLIC
    // Set controller X light to state TRUE or FALSE
    setLight(controller, state){
        let lights = [];
        lights[0] = (state & controller==1 ? 0xFF : 0x00)
	    lights[1] = (state & controller==2 ? 0xFF : 0x00)
	    lights[2] = (state & controller==3 ? 0xFF : 0x00)
        lights[3] = (state & controller==4 ? 0xFF : 0x00)
        console.log('lights: ',lights);
        let data_out = Buffer.from([0x0,...lights,0x0]);
        try {
            BuzzDevice.write(data_out);
        } catch (error) {
            console.log('error', error);
        }
    }

    // PUBLIC
    // Set controllers lights to array of states [true/false]
    setLights(lightsArray){
        // TODO
    }

    // PUBLIC
    // Set controller X light on
    setLightOn(controller){
        this.lights[controller] = 0xFF;
        let data_out = Buffer.from([0x0,...this.lights,0x0]);
        try {
            this.write(data_out);
        } catch (error) {
            console.log('error', error);
        }
    }

    // PUBLIC
    // Set ALL remotes lights ON
    setAllLightsOn(){
        console.log('[RMT] Setting all lights on...');
        let data_out = Buffer.from([0x0,0xFF,0xFF,0xFF,0xFF,0x0]);
        try {
            this.write(data_out);
        } catch (error) {
            console.log('error', error);
        }
    }

    // PUBLIC
    // Set ALL remotes lights OFF
    setAllLightsOff(){
        console.log('[RMT] Setting all lights off...');
        let data_out = Buffer.from([0x0,0x0,0x0,0x0,0x0,0x0]);
        try {
            this.write(data_out);
        } catch (error) {
            console.log('error', error);
        }
    }

    // PUBLIC
    // Set controller X light on for secs time
    setLightOnFor(controller, secs){
        BuzzDevice.setLightOn(controller);
        setTimeout(function () {
            BuzzDevice.setLightOff(controller);
        }, secs*1000);
    }

    // PUBLIC
    // Set controller X light off
    setLightOff(controller){
        this.lights[controller] = 0x00;
        let data_out = Buffer.from([0x0,...this.lights,0x0]);
        try {
            BuzzDevice.write(data_out);
        } catch (error) {
            console.log('error', error);
        }
    }

    // PUBLIC
    // Flip controller X light
    flipLight(controller){
        if(this.lights[controller]){
            setLightOff(controller);
        } else {
            setLightOn(controller);
        }
    }

    // PUBLIC
    // Get current light state for controller X
    getLightState(controller){
        return this.lights[controller];
    }

    // -------------- SETUP ----------------- //

    // PRIVATE
    // Setup connection to remotes
    setupRemotes(){
        usb.setDebugLevel(3);
        // idVendor=1356, idProduct=2
        this.device = usb.findByIds(1356, 2);
        this.driverAttached = true;
        
        // Open the Device
        try {
            this.device.open();
        } catch (e) {
            try {
                this.device.close();
            } catch (e) {
                console.log('error opening', e);  
            }
        }
        
        //console.log('device.interfaces[0].isKernelDriverActive()', this.device.interfaces[0].isKernelDriverActive());
        
        if (this.device.interfaces[0].isKernelDriverActive()) {
            this.driverAttached = true;
            this.device.interfaces[0].detachKernelDriver();
        } 

        
        // Claim the Interface

        try {
            this.device.interfaces[0].claim();
        } catch (error) {
            console.log('error claiming', error);
            try {
                this.close();
                process.exit(1);
            } catch (e) {
                console.log('error closing', e);  
            }
        } 
        console.log('[RMT] Interface successfuly claimed!');
    }


        
    // -------------- UTIL METHODS ----------------- //

    handleEvent(eventemmiter, data, ep) {
        //console.log('[RMT] Receiving dataBuffer ', data);
        let parsedValue = this.parseControllerBit(data);
        if(parsedValue!=true){
            console.log('[RMT] Emiting press event with ', data);
            eventemmiter.emit('press', parsedValue);
        }
    }

    // PRIVATE
    // Parse data from event
    parseControllerBit(data, ep){

        // TODO!
        // IGNORE IF IS MULTIPLE INPUTS
        // By default, there's always some event with only one input before a multiple one
        // Has to be tested

        // IGNORE IF IS RELEASE
        if(Buffer.compare(data,Buffer.from([127, 127, 0, 0, 240]))==0){
            //console.log('Release Data');
            return true;
        }

        let dataUInt = data.readUIntBE(2,3);
        //console.log('readUIntBE', dataUInt);

        //console.log('------------------------');
        let pressedValue = {};

        if(dataUInt & 0x1F0000){
            pressedValue.ctrl = 1;
            // CHECK IF IS CONTROLLER 1
            // BITWISE "AND" WITH 00 00 1F 00 00
            if(dataUInt & 0x010000) pressedValue.btn = 0; 
            if(dataUInt & 0x100000) pressedValue.btn = 1; 
            if(dataUInt & 0x080000) pressedValue.btn = 2;
            if(dataUInt & 0x040000) pressedValue.btn = 3;
            if(dataUInt & 0x020000) pressedValue.btn = 4; 
        } 
        if (dataUInt & 0xE00300){
            pressedValue.ctrl = 2;
            // CHECK IF IS CONTROLLER 2
            // BITWISE "AND" WITH 00 00 E0 03 00
            if(dataUInt & 0x200000) pressedValue.btn = 0;
            if(dataUInt & 0x000200) pressedValue.btn = 1;
            if(dataUInt & 0x000100) pressedValue.btn = 2;
            if(dataUInt & 0x800000) pressedValue.btn = 3;
            if(dataUInt & 0x400000) pressedValue.btn = 4;
        } 
        if (dataUInt & 0x7C00) {
            pressedValue.ctrl = 3;
            // CHECK IF IS CONTROLLER 3
            // BITWISE "AND" WITH 00 00 00 78 00
            if(dataUInt & 0x000400) pressedValue.btn = 0;
            if(dataUInt & 0x004000) pressedValue.btn = 1;
            if(dataUInt & 0x002000) pressedValue.btn = 2;
            if(dataUInt & 0x001000) pressedValue.btn = 3;
            if(dataUInt & 0x000800) pressedValue.btn = 4;
        } 
        if (dataUInt & 0x800F) {
            pressedValue.ctrl = 4;
            // CHECK IF IS CONTROLLER 4
            // BITWISE "AND" WITH 00 00 00 80 0F
            if(dataUInt & 0x008000) pressedValue.btn = 0;
            if(dataUInt & 0x000008) pressedValue.btn = 1;
            if(dataUInt & 0x000004) pressedValue.btn = 2;
            if(dataUInt & 0x000002) pressedValue.btn = 3;
            if(dataUInt & 0x000001) pressedValue.btn = 4;
        } 
        return pressedValue;
    }
}
