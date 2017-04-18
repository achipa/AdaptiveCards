import * as Adaptive from "adaptive-cards";
import * as Utils from "../utils";
import * as vkbeautify from "vkbeautify";

declare var SpeechSynthesisUtterance: any;

export abstract class HostContainer {
    private static playNextTTS(output: any[], iCurrent: number) {
        if (iCurrent < output.length) {
            let current = output[iCurrent];
            if (typeof current === "number") {
                setTimeout(() => {
                    HostContainer.playNextTTS(output, iCurrent + 1);
                }, current);
            } else {
                if (current.indexOf("http") == 0) {
                    let audio: any = document.getElementById('player');
                    audio.src = current;
                    audio.onended = () => {
                        HostContainer.playNextTTS(output, iCurrent + 1);
                    };
                    audio.onerror = () => {
                        HostContainer.playNextTTS(output, iCurrent + 1);
                    };
                    audio.play();
                } else {
                    let msg = new SpeechSynthesisUtterance();
                    //msg.voiceURI = 'native';
                    // msg.volume = 1; // 0 to 1
                    // msg.rate = 1; // 0.1 to 10
                    // msg.pitch = 2; //0 to 2
                    msg.text = current;
                    msg.lang = 'en-US';
                    msg.onerror = (event) => {
                        HostContainer.playNextTTS(output, iCurrent + 1);
                    };
                    msg.onend = (event) => {
                        HostContainer.playNextTTS(output, iCurrent + 1);
                    };
                    (<any>window).speechSynthesis.speak(msg);
                }
            }
        }
    }

    // process SSML markup into an array of either 
    // * utterenance
    // * number which is delay in msg
    // * url which is an audio file 
    private processNodes(nodes: NodeList, output: any[]): void {
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if (node.nodeName == 'p') {
                this.processNodes(node.childNodes, output);
                output.push(250);
            } else if (node.nodeName == 's') {
                this.processNodes(node.childNodes, output);
                output.push(100);
            } else if (node.nodeName == 'break') {
                if (node.attributes["strength"]) {
                    let strength = node.attributes["strength"].nodeValue;
                    if (strength == "weak") {
                        // output.push(50);
                    } else if (strength == "medium") {
                        output.push(50);
                    } else if (strength == "strong") {
                        output.push(100);
                    } else if (strength == "x-strong") {
                        output.push(250);
                    }
                } else if (node.attributes["time"]) {
                    output.push(JSON.parse(node.attributes["time"].value));
                }
            } else if (node.nodeName == 'audio') {
                if (node.attributes["src"]) {
                    output.push(node.attributes["src"].value);
                }
            } else if (node.nodeName == 'say-as') {
                this.processNodes(node.childNodes, output);
            } else if (node.nodeName == 'w') {
                this.processNodes(node.childNodes, output);
            } else if (node.nodeName == 'phoneme') {
                this.processNodes(node.childNodes, output);
            } else {
                output.push(node.nodeValue);
            }
        }
    }

    public getHostConfiguration(): Adaptive.IHostConfiguration {
        return {
            supportedElementTypes: [
                Adaptive.Container,
                Adaptive.TextBlock,
                Adaptive.Image,
                Adaptive.ImageSet,
                Adaptive.FactSet,
                Adaptive.ColumnSet,
                Adaptive.ActionSet,
                Adaptive.TextInput,
                Adaptive.DateInput,
                Adaptive.NumberInput,
                Adaptive.ChoiceSetInput,
                Adaptive.ToggleInput            
            ],
            supportsInteractivity: true,
            strongSeparation: {
                spacing: 40,
                lineThickness: 1,
                lineColor: "#EEEEEE"
            },
            fontFamily: "Segoe UI",
            fontSizes: {
                small: 12,
                normal: 14,
                medium: 17,
                large: 21,
                extraLarge: 26
            },
            fontWeights: {
                lighter: 200,
                normal: 400,
                bolder: 600
            },
            colors: {
                dark: {
                    normal: "#333333",
                    subtle: "#EE333333"
                },
                light: {
                    normal: "#FFFFFF",
                    subtle: "#88FFFFFF"
                },
                accent: {
                    normal: "#2E89FC",
                    subtle: "#882E89FC" 
                },
                attention: {
                    normal: "#FFD800",
                    subtle: "#DDFFD800"
                },
                good: {
                    normal: "#00FF00",
                    subtle: "#DD00FF00"
                },
                warning: {
                    normal: "#FF0000",
                    subtle: "#DDFF0000"
                }
            },
            imageSizes: {
                small: 40,
                medium: 80,
                large: 160
            },
            actions: {
                maxActions: 5,
                supportedActionTypes: [
                    Adaptive.HttpAction,
                    Adaptive.OpenUrlAction,
                    Adaptive.SubmitAction,
                    Adaptive.ShowCardAction
                ],
                separation: {
                    spacing: 20
                },
                buttonSpacing: 20,
                stretch: false,
                showCard: {
                    actionMode: Adaptive.ShowCardActionMode.InlineEdgeToEdge,
                    inlineCardSpacing: 16,
                    backgroundColor: "#08000000",
                    padding: {
                        top: 16,
                        right: 16,
                        bottom: 16,
                        left: 16
                    }
                },
                actionsOrientation: Adaptive.Orientation.Horizontal,
                actionAlignment: Adaptive.HorizontalAlignment.Left
            },
            adaptiveCard: {
                backgroundColor: "#00000000",
                padding: {
                    left: 20,
                    top: 20,
                    right: 20,
                    bottom: 20
                }
            },
            container: {
                separation: {
                    spacing: 20
                },
                normal: {
                },
                emphasis: {
                    backgroundColor: "#EEEEEE",
                    borderColor: "#AAAAAA",
                    borderThickness: {
                        top: 1,
                        right: 1,
                        bottom: 1,
                        left: 1
                    },
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                }
            },
            textBlock: {
                wrap: true,
                size: Adaptive.TextSize.Normal,
                weight: Adaptive.TextWeight.Normal,
                color: Adaptive.TextColor.Dark,
                separations: {
                    small: {
                        spacing: 20,
                    },
                    normal: {
                        spacing: 20
                    },
                    medium: {
                        spacing: 20
                    },
                    large: {
                        spacing: 20
                    },
                    extraLarge: {
                        spacing: 20
                    }
                }
            },
            image: {
                size: Adaptive.Size.Medium,
                separation: {
                    spacing: 20
                }
            },
            imageSet: {
                imageSize: Adaptive.Size.Medium,
                separation: {
                    spacing: 20
                }
            },
            factSet: {
                separation: {
                    spacing: 20
                },
                title: {
                    color: Adaptive.TextColor.Dark,
                    size: Adaptive.TextSize.Normal,
                    isSubtle: false,
                    weight: Adaptive.TextWeight.Bolder
                },
                value: {
                    color: Adaptive.TextColor.Dark,
                    size: Adaptive.TextSize.Normal,
                    isSubtle: false,
                    weight: Adaptive.TextWeight.Normal
                },
                spacing: 10
            },
            input: {
                separation: {
                    spacing: 20
                }
            },
            columnSet: {
                separation: {
                    spacing: 20
                }
            },
            column: {
                separation: {
                    spacing: 20
                }
            }
        };
    }

    protected renderContainer(renderedCard: HTMLElement): HTMLElement {
        return null;
    }

    protected renderSpeech(speechString: string, showXml: boolean = false): HTMLElement {
        var element = document.createElement("div");

        var button = document.createElement("button");
        button.className = "button";
        button.innerText = "Speak this card";

        var t = document.createTextNode("Speak");
        var output = new Array<any>();

        if (speechString[0] == '<') {
            if (speechString.indexOf("<speak") != 0) {
                speechString = '<speak>\n' + speechString + '\n</speak>\n';
            }

            var parser = new DOMParser();
            var dom = parser.parseFromString(speechString, "text/xml");
            var nodes = dom.documentElement.childNodes;

            this.processNodes(nodes, output);

            var serializer = new XMLSerializer();
            
            speechString = vkbeautify.xml(serializer.serializeToString(dom));;
        }
        else {
            output.push(speechString);
            speechString = vkbeautify.xml(speechString);
        }

        button.addEventListener("click", function () {
            HostContainer.playNextTTS(output, 0);
        });

        Utils.appendChild(element, button);

        if (showXml) {
            let pre = document.createElement("pre");
            Utils.appendChild(pre, document.createTextNode(speechString));
            Utils.appendChild(element, pre);
        }

        var audio = document.createElement("audio");
        audio.id = 'player';
        audio.autoplay = true;

        Utils.appendChild(element, audio);

        return element;
    }

    readonly styleSheet: string;

    supportsActionBar: boolean = false;

    constructor(styleSheet: string) {
        this.styleSheet = styleSheet;
    }

    render(renderedCard: HTMLElement, speechString: string, showSpeechXml: boolean = false): HTMLElement {
        var element = document.createElement("div");
        var renderedContainer = this.renderContainer(renderedCard);

        if (renderedContainer) {
            element.appendChild(renderedContainer);

            var separator = document.createElement("div");
            separator.style.height = "20px";

            element.appendChild(separator);
        }

        element.appendChild(this.renderSpeech(speechString));

        return element;
    }
}

