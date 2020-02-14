class ValidInput {
    constructor(string) {
        this.firstWord = string.slice(0, string.indexOf(' ')).toUpperCase();
        this.lastWord = string.slice((string.lastIndexOf(' ')) + 1).toUpperCase();
        this.return = undefined;
        this.affirmative = ['YES', 'YEAH', 'YUP', 'YUPPER', 'MHM', 'MMHMM', 'AFFIRMATIVE',];
        this.negatory = ['NO', 'NOPE', 'NADA', 'NEGATORY'];
        this.direction = ['GO', 'TRAVEL', 'LEAVE', 'EXIT', 'N', 'NORTH', 'S', 'SOUTH', 'E', 'EAST', 'W', 'WEST', 'INSIDE', 'IN'];
        this.inventory = ['B', 'INVENTORY', 'BAG', 'BACKPACK'];
        this.status = ['STATUS', 'INFO', 'HP', 'HEALTH'];
        this.inspect = ['INSPECT', 'EXAMINE', 'ROOM', 'LOOK', 'AROUND', 'EXPLORE'];
        this.instructions = ['D', 'DIRECTIONS', 'INSTRUCTIONS', 'INST', 'HOW', 'PLAY', 'HELP'];
        this.pickUpItem = ['PICK UP', 'PICK', 'GRAB', 'GET', 'TAKE', 'AQUIRE'];
        this.useItem = ['USE'];
        this.combat = ['ATTACK', 'FIGHT', 'THROW', 'SHOOT', 'FIRE'];
        this.items = ['KIT', 'METAL', 'BATTERY', 'COATING', 'BOX', 'GRENADE', 'SHIELD', 'BOMB', 'CELL', 'NUCLEAR', 'RAY', 'ALL', 'LAUNCHER', 'MODULE', 'CANNON', 'LETTER', 'PLATING', 'DIODE'];
        this.otherActions = ['DROP', 'THROW', 'FART', 'LAUGH', 'LOL', 'HUG', 'READ', 'OPEN', 'RUN', 'CHECK'];
        this.intObjects = ['SIGN', 'DESK', 'COMPUTER', 'CABINET', 'FRIDGE', 'REFRIDGERATOR', 'SAFE', 'MAP', 'DIRECTORY', 'PAINTING', 'PICTURE', 'PORTRAIT'];
        this.falloutBunkerEvent = ['REPAIR', 'FIX', 'KEYCARD', 'KEY', 'CRAFT'];
        this.validInputs = [this.affirmative, this.negatory, this.direction, this.inventory, this.status, this.inspect, this.instructions, this.useItem, this.pickUpItem, this.combat, this.items, this.otherActions, this.intObjects, this.falloutBunkerEvent];
    }
    //checks first word of input
    firstInputTrue() {
        for (let arr of this.validInputs) {
            for (let item of arr) {
                if (this.firstWord === item.toString()) {
                    return true;
                }
            }
        }
        return false;
    }
    //checks last word of input
    lastWordTrue() {
        for (let arr of this.validInputs) {
            for (let item of arr) {
                if (this.lastWord === item.toString()) {
                    return true;
                }
            }
        }
        return false;
    }
    //determines the return output of each valid entry
    returnInput(obj) {
        if (this.affirmative.includes(obj.firstWord) || this.affirmative.includes(obj.lastWord)) {
            this.return = 'y';
        } else if (this.negatory.includes(obj.firstWord) || this.negatory.includes(obj.lastWord)) {
            this.return = 'n';
        } else if (this.inventory.includes(obj.firstWord) || this.inventory.includes(obj.lastWord)) {
            this.return = 'i';
        } else if (this.status.includes(obj.firstWord) || this.status.includes(obj.lastWord)) {
            this.return = 's';
        } else if (this.inspect.includes(obj.firstWord) || this.inspect.includes(obj.lastWord)) {
            if (this.inspect.includes(obj.firstWord)) {
                if (obj.lastWord === 'BOX') {
                    this.return = 'use_rbox';
                } else if (obj.lastWord === 'SIGN') {
                    this.return = 'read_sign';
                } else if (obj.lastWord === 'MAP' || obj.lastWord === 'DIRECTORY') {
                    this.return = 'read_map';
                } else if (obj.lastWord === 'DESK') {
                    this.return = 'open_desk';
                } else if (obj.lastWord === 'CABINET') {
                    this.return = 'open_cabinet';
                } else if (obj.lastWord === 'FRIDGE' || obj.lastWord === 'REFRIDGERATOR') {
                    this.return = 'open_fridge';
                } else if (obj.lastWord === 'SAFE') {
                    this.return = 'open_safe';
                } else if (obj.lastWord === 'CHEST') {
                    this.return = 'use_chest';
                } else if (obj.lastWord === 'LETTER') {
                    this.return = 'read_letter';
                } else if (obj.lastWord === 'PAINTING' || obj.lastWord === 'PICTURE' || obj.lastWord === 'PORTRAIT') {
                    this.return = 'move_pic'
                } else if (obj.lastWord === 'ROOM') {
                    this.return = 'insp';
                } else if (obj.firstWord === 'LOOK' && obj.lastWord === 'AROUND') {
                    this.return = 'insp';
                }
            } else if (obj.firstWord === 'CHECK' && obj.lastWord === 'ROOM') {
                this.return = 'insp';
            } else if (!(this.inspect.includes(obj.firstWord)) && this.inspect.includes(obj.lastWord) && obj.firstWord !== 'INSPEC' && obj.firstWord !== 'EXAMIN' && obj.firstWord !== 'EXPLOR') {
                this.return = 'not_sure';
            } else {
                this.return = 'insp';
            }
        } else if (this.falloutBunkerEvent.includes(obj.firstWord) || this.falloutBunkerEvent.includes(obj.lastWord)) {
            this.return = 'fob_craft';
        } else if (obj.firstWord === 'OPEN' || obj.lastWord === 'OPEN') {
            if (obj.lastWord === 'DESK') {
                this.return = 'open_desk';
            } else if (obj.lastWord === 'CABINET') {
                this.return = 'open_cabinet';
            } else if (obj.lastWord === 'FRIDGE' || obj.lastWord === 'REFRIDGERATOR') {
                this.return = 'open_fridge';
            } else if (obj.lastWord === 'SAFE') {
                this.return = 'open_safe'
            } else if (obj.lastWord === 'BOX') {
                this.return = 'use_rbox';
            } else if (obj.lastWord === 'CHEST') {
                this.return = 'use_chest';
            } else {
                this.return = 'open_null';
            }
        }
        else if (obj.firstWord === 'READ' || obj.lastWord === 'READ') {
            if (obj.lastWord === 'BOX') {
                this.return = 'use_rbox';
            } else if (obj.lastWord === 'SIGN') {
                this.return = 'read_sign';
            } else if (obj.lastWord === 'MAP' || obj.lastWord === 'DIRECTORY') {
                this.return = 'read_map';
            } else if (obj.lastWord === 'LETTER') {
                this.return = 'read_letter';
            } else {
                this.return = 'read_null';
            }
        } else if (this.pickUpItem.includes(obj.firstWord) && this.intObjects.includes(obj.lastWord)) {
            if (obj.lastWord === 'CABINET') {
                this.return = 'no_pu_cabinet';
            } else if (obj.lastWord === 'DESK') {
                this.return = 'no_pu_desk';
            } else if (obj.lastWord === 'COMPUTER') {
                this.return = 'no_pu_comp';
            } else if (obj.lastWord === 'SAFE') {
                this.return = 'no_pu_safe';
            } else if (obj.lastWord === 'SIGN') {
                this.return = 'no_pu_sign';
            } else if (obj.lastWord === 'FRIDGE') {
                this.return = 'no_pu_fridge';
            } else if (obj.lastWord === 'REFRIDGERATOR') {
                this.return = 'no_pu_fridge';
            } else {
                this.return = 'no_pickup';
            }
        } else if (obj.firstWord === 'DROP' || obj.lastWord === 'DROP') {
            if (obj.lastWord === 'BATTERY') {
                this.return = 'drop_particlebattery';
            } else if (obj.lastWord === 'COATING') {
                this.return = 'drop_carboncoating';
            } else if (obj.lastWord === 'KIT') {
                this.return = 'drop_repairkit';
            } else if (obj.lastWord === 'BOX') {
                this.return = 'drop_rbox';
            } else if (obj.lastWord === 'GRENADE') {
                this.return = 'drop_grenade';
            } else if (obj.lastWord === 'SHIELD') {
                this.return = 'drop_shield';
            } else if (obj.lastWord === 'BOMB') {
                this.return = 'drop_bomb';
            } else if (obj.lastWord === 'METAL') {
                this.return = 'drop_scrapmetal'
            } else if (obj.lastWord === 'CELL') {
                this.return = 'drop_fuelcell';
            } else if (obj.lastWord === 'RAY') {
                this.return = 'drop_heatray';
            } else if (obj.lastWord === 'LAUNCHER') {
                this.return = 'drop_launcher';
            } else if (obj.lastWord === 'MODULE') {
                this.return = 'drop_module';
            } else if (obj.lastWord === 'CANNON') {
                this.return = 'drop_cannon';
            } else if (obj.lastWord === 'CHEST') {
                this.return = 'drop_chest';
            } else if (obj.lastWord === 'EMP') {
                this.return = 'drop_emp';
            } else if (obj.lastWord === 'DIODE') {
                this.return = 'drop_diode';
            } else if (obj.lastWord === 'PLATING') {
                this.return = 'drop_plating';
            } else if (obj.lastWord === 'LETTER') {
                this.return = 'drop_letter';
            } else {
                this.return = 'drop_null';
            }
        } else if (this.direction.includes(obj.firstWord) || this.direction.includes(obj.lastWord)) {
            if (obj.firstWord === 'NORTH' || obj.lastWord === 'NORTH' || obj.firstWord === 'N' || obj.lastWord === 'N') {
                this.return = 'dn';
            } else if (obj.firstWord === 'SOUTH' || obj.lastWord === 'SOUTH' || obj.firstWord === 'S' || obj.lastWord === 'S') {
                this.return = 'ds';
            } else if (obj.firstWord === 'EAST' || obj.lastWord === 'EAST' || obj.firstWord === 'E' || obj.lastWord === 'E') {
                this.return = 'de';
            } else if (obj.firstWord === 'WEST' || obj.lastWord === 'WEST' || obj.firstWord === 'W' || obj.lastWord === 'W') {
                this.return = 'dw';
            } else if (obj.firstWord === 'INSIDE' || obj.lastWord === 'INSIDE' || obj.firstWord === 'IN' || obj.lastWord === 'IN') {
                this.return = 'di';
            } else {
                this.return = 'dnull';
            }
        } else if (obj.firstWord === 'USE' || obj.lastWord === 'USE') {
            if (obj.lastWord === 'BATTERY') {
                this.return = 'use_particlebattery';
            } else if (obj.lastWord === 'COATING') {
                this.return = 'use_carboncoating';
            } else if (obj.lastWord === 'KIT') {
                this.return = 'use_repairkit';
            } else if (obj.lastWord === 'BOX') {
                this.return = 'use_rbox';
            } else if (obj.lastWord === 'GRENADE') {
                this.return = 'use_grenade';
            } else if (obj.lastWord === 'SHIELD') {
                this.return = 'use_shield';
            } else if (obj.lastWord === 'BOMB') {
                this.return = 'use_bomb';
            } else if (obj.lastWord === 'METAL' || obj.lastWord === 'CELL') {
                this.return = 'no_use'
            } else if (obj.lastWord === 'COMPUTER') {
                this.return = 'use_comp';
            } else if (obj.lastWord === 'RAY') {
                this.return = 'use_heatray';
            } else if (obj.lastWord === 'EMP') {
                this.return = 'use_emp';
            } else if (obj.lastWord === 'CHEST') {
                this.return = 'use_chest';
            } else if (obj.lastWord === 'PLATING') {
                this.return = 'use_plating';
            } else if (obj.lastWord === 'LETTER') {
                this.return = 'read_letter';
            } else {
                this.return = 'use_null';
            }
        } else if (obj.firstWord === 'CHECK' || obj.lastWord === 'CHECK') {
            if (obj.lastWord === 'DESK') {
                this.return = 'open_desk';
            } else if (obj.lastWord === 'CABINET') {
                this.return = 'open_cabinet';
            } else if (obj.lastWord === 'FRIDGE' || obj.lastWord === 'REFRIDGERATOR') {
                this.return = 'open_fridge';
            } else if (obj.lastWord === 'SAFE') {
                this.return = 'open_safe';
            } else if (obj.lastWord === 'MAP' || obj.lastWord === 'DIRECTORY') {
                this.return = 'read_map';
            } else if (obj.lastWord === 'BOX') {
                this.return = 'use_rbox';
            } else if (obj.lastWord === 'SIGN') {
                this.return = 'read_sign';
            } else if (obj.lastWord === 'CHEST') {
                this.return = 'use_chest';
            } else if (obj.lastWord === 'PAINTING' || obj.lastWord === 'PICTURE' || obj.lastWord === 'PORTRAIT') {
                this.return = 'move_pic'
            }  else if (obj.lastWord === 'LETTER') {
                this.return = 'read_letter';
            } else {
                this.return = 'check_null';
            }
        } else if (this.combat.includes(obj.firstWord) || this.combat.includes(obj.lastWord)) {
            if (obj.firstWord === 'THROW' || obj.lastWord === 'THROW') {
                if (obj.lastWord === 'GRENADE') {
                    this.return = 'use_grenade';
                } else if (obj.lastWord === 'BOMB') {
                    this.return = 'use_bomb';
                } else if (obj.lastWord === 'METAL') {
                    this.return = 'throw_metal';
                } else if (obj.lastWord === 'EMP') {
                    this.return = 'use_emp';
                } else {
                    this.return = 'throw_null';
                }
            } else if (obj.firstWord === 'SHOOT' && obj.lastWord === 'RAY') {
                this.return = 'use_heatray';
            } else if (obj.firstWord === 'FIRE' && obj.lastWord === 'RAY') {
                this.return = 'use_heatray';
            } else {
                this.return = 'combat';
            }
        } else if ((this.pickUpItem.includes(obj.firstWord) || this.items.includes(obj.firstWord) || this.items.includes(obj.lastWord)) && !this.otherActions.includes(obj.firstWord)) {
            if (obj.firstWord === 'METAL' || obj.lastWord === 'METAL') {
                this.return = 'pu_scrapmetal';
            } else if (obj.firstWord === 'BATTERY' || obj.lastWord === 'BATTERY') {
                this.return = 'pu_particlebattery';
            } else if (obj.firstWord === 'COATING' || obj.lastWord === 'COATING') {
                this.return = 'pu_carboncoating';
            } else if (obj.firstWord === 'KIT' || obj.lastWord === 'KIT') {
                this.return = 'pu_repairkit';
            } else if (obj.firstWord === 'BOX' || obj.lastWord === 'BOX') {
                this.return = 'pu_rbox';
            } else if (obj.firstWord === 'GRENADE' || obj.lastWord === 'GRENADE') {
                this.return = 'pu_grenade';
            } else if (obj.firstWord === 'SHIELD' || obj.lastWord === 'SHIELD') {
                this.return = 'pu_shield';
            } else if (obj.firstWord === 'BOMB' || obj.lastWord === 'BOMB') {
                this.return = 'pu_bomb';
            } else if (obj.firstWord === 'NUCLEAR' || obj.firstWord === 'CELL' || obj.lastWord === 'NUCLEAR' || obj.lastWord === 'CELL') {
                this.return = 'pu_fuelcell';
            } else if (obj.firstWord === 'RAY' || obj.lastWord === 'RAY') {
                this.return = 'pu_heatray';
            } else if (obj.firstWord === 'LAUNCHER' || obj.lastWord === 'LAUNCHER') {
                this.return = 'pu_launcher';
            } else if (obj.firstWord === 'MODULE' || obj.lastWord === 'MODULE') {
                this.return = 'pu_module';
            } else if (obj.firstWord === 'CANNON' || obj.lastWord === 'CANNON') {
                this.return = 'pu_cannon';
            } else if (obj.firstWord === 'ALL' || obj.lastWord === 'ALL') {
                this.return = 'pu_all';
            } else if (obj.firstWord === 'CHEST' || obj.lastWord === 'CHEST') {
                this.return = 'pu_chest';
            } else if (obj.firstWord === 'EMP' || obj.lastWord === 'EMP') {
                this.return = 'pu_emp';
            } else if (obj.firstWord === 'PLATING' || obj.lastWord === 'PLATING') {
                this.return = 'pu_plating';
            } else if (obj.firstWord === 'DIODE' || obj.lastWord === 'DIODE') {
                this.return = 'pu_diode';
            } else if (obj.firstWord === 'LETTER' || obj.lastWord === 'LETTER') {
                this.return = 'pu_letter';
            } else {
                this.return = 'pu_null';
            }
        } else if (this.instructions.includes(obj.firstWord) || this.instructions.includes(obj.lastWord)) {
            this.return = 'd';
        } else if (this.otherActions.includes(obj.firstWord) || this.otherActions.includes(obj.lastWord)) {
            this.return = 'no_do';
            //add other actions here .... this is where some easter eggs would go, and some silly inputs if I have time
        }
        else {
            return 'not_sure';
        }
    }
}

export {ValidInput}