Vue.component('model-types', {
    template: `
        <div class="model-types">
        <div class="buttons">
            <h3>Тип модели</h3>
            <button
                    v-for="(modelType, index) in modelTypes"
                    :key="index"
                    @click="selectModelType(index)"
                    :class="{ selectedButton: selectedModelType == index }"
            >
                {{ modelType.name }}
            </button>
        </div>
        <div class="images">
            <div class="image-container" v-for="image in modelTypes[selectedModelType].images">
                <img :src="image">
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            selectedModelType: 0,
            modelTypes: [
                {
                    name: "Первый тип",
                    images: [
                        "assets/model type 1 angle 1.png",
                        "assets/model type 1 angle 2.png",
                        "assets/model type 1 angle 3.png"
                    ]
                },
                {
                    name: "Второй тип",
                    images: [
                        "assets/model type 2 angle 1.png",
                        "assets/model type 2 angle 2.png",
                        "assets/model type 2 angle 3.png"
                    ]
                },
                {
                    name: "Третий тип",
                    images: [
                        "assets/model type 3 angle 1.png",
                        "assets/model type 3 angle 2.png",
                        "assets/model type 3 angle 3.png"
                    ]
                }
            ]
        };
    },
    methods: {
        selectModelType(index) {
            this.selectedModelType = index;
            this.$emit('update:modelType', index + 1);
        }
    }
});

Vue.component('platform-types', {
    template: `
        <div class="platform-types">
        <div class="buttons">
            <h3>Тип платформы</h3>
            <button
                    v-for="(platformType, index) in platformTypes"
                    :key="index"
                    @click="selectPlatformType(index)"
                    :class="{ selectedButton: selectedPlatformType == index }"
            >
                {{ platformType.name }}
            </button>
        </div>
        <div class="images">
            <div class="image-container">
                <img :src="platformTypes[selectedPlatformType].image"/>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            selectedPlatformType: 0,
            platformTypes: [
                {
                    name: "Без платформы",
                    image: "assets/without platform.png"
                },
                {
                    name: "Первый тип",
                    image: "assets/platform type 1.png"
                },
                {
                    name: "Второй тип",
                    image: "assets/platform type 2.png"
                }
            ]
        };
    },
    methods: {
        selectPlatformType(index) {
            this.selectedPlatformType = index;
            this.$emit('update:platformType', index);
        }
    }
});

Vue.component("data-model-type1", {
    template: `
        <div class="data-model-type1">
            <div>
                <label for="word1">Первое слово</label>
                <input type="text" id="word1" v-model="word1" @input="handleInput">
              </div>
              <div>
                <label for="word2">Второе слово</label>
                <input type="text" id="word2" v-model="word2" @input="handleInput">
              </div>
        </div>
    `,
    data() {
        return {
            word1: "",
            word2: ""
        }
    },
    methods: {
        handleInput() {
            this.word1 = this.word1.toUpperCase();
            this.word2 = this.word2.toUpperCase();
            this.$emit('update:modelDataType1', [this.word1, this.word2]);
        }
    }
})

Vue.component("data-model-type2", {
    template: `
        <div class="data-model-type2">
            <div>
                <p>Первое слово</p>
                <input 
                    type="text" 
                    v-for="(item, index) in letters1" 
                    :key="index"
                    v-model="letters1[index]"
                    @input="handleInput"
                />
            </div>
            <div>
                <p>Второе слово</p>
                <input 
                    type="text" 
                    v-for="(item, index) in letters2" 
                    :key="index"
                    v-model="letters2[index]"
                    @input="handleInput"
                />
            </div>
            <div>
                <p>Количество ячеек</p>
                <input type="number" v-model.number="countCells" min="1" max="100" step="1" @input="changeCountCells">
            </div>
        </div>
    `,
    data() {
        return {
            countCells: 1,
            letters1: [""],
            letters2: [""]
        }
    },
    methods: {
        changeCountCells() {
            if (this.countCells == "") {
                this.letters1=[""]
                this.letters2=[""]
            }
            else {
                if (this.countCells > 100) {
                    this.countCells = 100
                }
                while (this.letters1.length > this.countCells) {
                    this.letters1.pop()
                    this.letters2.pop()
                }
                while (this.letters1.length < this.countCells) {
                    this.letters1.push("")
                    this.letters2.push("")
                }
            }
            this.$emit('update:modelDataType2', [this.letters1, this.letters2]);
        },
        handleInput() {
            for (let i = 0; i < this.countCells; ++i) {
                this.letters1[i] = this.letters1[i].toUpperCase();
                this.letters2[i] = this.letters2[i].toUpperCase();
            }
            this.$emit('update:modelDataType2', [this.letters1, this.letters2]);
        }
    }
})

Vue.component("arrows-box", {
    template: `
        <div class="arrows-box">
            <canvas ref="canvas" :width="widthCanvas" height="150"></canvas>
            <div class="arrows">
                <vue-slider v-model="values" :min="0" :max="widthSlider" :dot-options="dotOptions" @change="updateArrows"></vue-slider>
            </div>
        </div>
    `,
    props: {
        word: {
            required: true,
            type: String
        },
        countArrows: {
            required: true,
            type: Number
        }
    },
    components: {
        VueSlider: window["vue-slider-component"]
    },
    data() {
        return {
            values: [0,],
            dotOptions: [{},],
            widthCanvas: 300,
            widthSlider: 300
        };
    },
    mounted() {
        this.drawText();
    },
    watch: {
        word: {
            handler() {
                this.drawText();
            },
            immediate: true
        },
        countArrows: {
            handler() {
                if (this.countArrows == "") {
                    this.values = [0]
                    this.dotOptions = [{}]
                }
                else {
                    while (this.values.length > this.countArrows) {
                        this.values.pop()
                        this.dotOptions.pop()
                    }
                    while (this.values.length < this.countArrows) {
                        this.values.push(0)
                        this.dotOptions.push({})
                    }
                }
                this.drawText()
            },
            immediate: true
        }
    },
    computed: {
        lengths() {
            res = [0]
            for (let el of this.values) {
                res.push(el / this.widthSlider)
            }
            res.push(1)
            return res
        }
    },
    methods: {
        updateArrows() {
            if (!Array.isArray(this.values)) {
                this.values = [this.values]
                this.dotOptions = [this.dotOptions]
            }
            this.drawText()
        },
        drawText() {
            const canvas = this.$refs.canvas
            const ctx = canvas.getContext('2d')

            // Очищаем холст перед рисованием
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Настройки текста
            ctx.font = '120px Arial'
            ctx.fillStyle = 'black'
            ctx.textAlign = 'left'
            this.widthCanvas = Math.max(200, ctx.measureText(this.word).width),
            requestAnimationFrame(() => {
                ctx.font = '120px Arial'
                ctx.fillText(this.word, 0, 120)
                let {minX, maxX} = this.findLeftRightEdges()
                if (minX === null) {
                    minX = 0
                }
                if (maxX === null) {
                    maxX = 0
                }
                let newWidthSlider = maxX - minX
                for (let i = 0; i < this.values.length; ++i) {
                    if (this.values[i] > newWidthSlider) {
                        this.values[i] = newWidthSlider
                    }
                }
                this.widthSlider = newWidthSlider
                this.drawLines()
            })

            this.$emit('update:arrowsData', this.lengths);
        },
        drawLines() {
            const canvas = this.$refs.canvas
            const ctx = canvas.getContext('2d')
            let {minX, maxX} = this.findLeftRightEdges()
            for (let i = 0; i < this.values.length; i++) {
                ctx.fillRect(this.values[i] + minX, 0, 1, 150)
            }
        },
        findLeftRightEdges() {
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d')

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const {width, height} = imageData;
            const data = imageData.data; // Массив пикселей
            let minX = null;
            let maxX = null;

            // Идём по всем пикселям
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4; // Индекс пикселя в массиве (R, G, B, A)

                    const red = data[index];
                    const green = data[index + 1]
                    const blue = data[index + 2]
                    const alpha = data[index + 3]

                    // Проверяем, является ли пиксель окрашенным (альфа > 0 или цвет не белый)
                    if (alpha > 0 && (red !== 256 || green !== 256 || blue !== 256)) {
                        // Устанавливаем левый край
                        if (minX === null || x < minX) {
                            minX = x
                        }

                        // Устанавливаем правый край
                        if (maxX === null || x > maxX) {
                            maxX = x
                        }
                    }
                }
            }
            return {minX, maxX}
        }
    }
})

Vue.component("data-model-type3", {
    template: `
        <div class="data-model-type3">
            <data-model-type1 @update:modelDataType1="updateWords($event)"></data-model-type1>
            <div class="arrows-boxes">
                <arrows-box :word="word1" :countArrows="countArrows" @update:arrowsData="updateArrowsData($event, 1)"></arrows-box>
                <arrows-box :word="word2" :countArrows="countArrows" @update:arrowsData="updateArrowsData($event, 2)"></arrows-box>
            </div>
            <div>
                <p>Количество разделителей</p>
                <input type="number" v-model.number="countArrows" min="1" max="100" step="1" @input="updateCountArrows">
            </div>
        </div>
    `,
    data() {
        return {
            word1: "",
            word2: "",
            countArrows: 1,
            lengths1: [0,0,1],
            lengths2: [0,0,1]
        }
    },
    methods: {
        updateWords(words) {
            this.word1 = words[0]
            this.word2 = words[1]
            this.$emit('update:modelDataType3', [this.word1, this.word2, this.lengths1, this.lengths2])
        },
        updateCountArrows() {
            this.countArrows = Math.min(this.countArrows, 100)
        },
        updateArrowsData(data, index) {
            if (index == 1) {
                this.lengths1 = data
            } else {
                this.lengths2 = data
            }
            this.$emit('update:modelDataType3', [this.word1, this.word2, this.lengths1, this.lengths2])
        }
    }
})

Vue.component("data-platform", {
    template: `
        <div class="data-platform">
            <div>
                <label for="height">Высота платформы относительно высоты букв</label>
                <input type="number" id="height" v-model="height" @input="handleInput">
              </div>
              <div>
                <label for="offset">Отступ платформы от букв относительно высоты букв</label>
                <input type="number" id="offset" v-model="offset" @input="handleInput">
              </div>
        </div>
    `,
    data() {
        return {
            height: 0.1,
            offset: 0.1
        }
    },
    methods: {
        handleInput() {
            this.$emit('update:platformData', [this.height, this.offset])
        }
    }
})

Vue.component('expansion-types', {
    template: `
        <div class="expansion-types">
        <div class="buttons">
            <h3>Расширение файла</h3>
            <button
                    v-for="(expansionType, index) in expansionTypes"
                    :key="index"
                    @click="selectExpansionType(index)"
                    :class="{ selectedButton: selectedExpansionType == index }"
            >
                {{ expansionType.name }}
            </button>
        </div>  
    </div>
    `,
    data() {
        return {
            selectedExpansionType: 0,
            expansionTypes: [
                {
                    name: "blend",
                },
                {
                    name: "obj",
                },
                {
                    name: "stl",
                }
            ]
        };
    },
    methods: {
        selectExpansionType(index) {
            this.selectedExpansionType = index;
            this.$emit('update:expansionType', this.expansionTypes[index].name);
        }
    }
});

var vue = new Vue({
    el: "#app",
    data: {
        selectedModelType: 1,
        selectedPlatformType: 0,
        word11: "",
        word12: "",
        word21: "",
        word22: "",
        word31: "",
        word32: "",
        countLetters1: [],
        countLetters2: [],
        lengths1: [0,0,1],
        lengths2: [0,0,1],
        height: 0.1,
        offset: 0.1,
        arg1: "",
        arg2: "",
        output: "",
        isLoading: false,
        selectedExpansionType: "blend"
    },
    methods: {
        startGeneration() {
            let word1 = ""
            let word2 = ""

            if (this.selectedModelType == 1) {
                word1 = this.word11
                word2 = this.word12
                if (word1.length != word2.length) {
                    alert("Длины слов не равны")
                    return
                }
            } else if (this.selectedModelType == 2) {
                word1 = this.word21
                word2 = this.word22
                for (let i = 0; i < this.countLetters1.length; ++i) {
                    if (this.countLetters1[i] == "" || this.countLetters2[i] == "") {
                        alert("Есть незаполненный элемент")
                        return
                    }
                }
            } else if (this.selectedModelType == 3) {
                word1 = this.word31
                word2 = this.word32
            }

            if (word1.length == 0 || word2.length == 0) {
                alert("Длина слова не может быть равна 0")
                return
            }
            
            // Show loading indicator
            this.isLoading = true;
            
            // Prepare request data
            const requestData = {
                word1: word1,
                word2: word2,
                type_model: this.selectedModelType,
                type_platform: this.selectedPlatformType,
                offset_platform: this.offset,
                height_platform: this.height,
                expansion: this.selectedExpansionType
            };
            
            // Add model-specific parameters
            if (this.selectedModelType === 2) {
                requestData.counts_letters1 = this.countLetters1.join(',');
                requestData.counts_letters2 = this.countLetters2.join(',');
            } else if (this.selectedModelType === 3) {
                requestData.lengths1 = this.lengths1.join(',');
                requestData.lengths2 = this.lengths2.join(',');
            }
            
            const apiUrl = 'http://localhost:8080/generate';
            
            // Send request to the server
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`Server responded with status ${response.status}: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                this.isLoading = false;
                if (data.status === 'success') {
                    // Model generated successfully, offer download                    
                    alert(`Модель успешно создана! Нажмите OK для загрузки.`);
                    
                    window.location.href = 'http://localhost:8080' + data.download_url;
                } else {
                    alert('Ошибка при создании модели: ' + (data.error || 'Неизвестная ошибка'));
                }
            })
            .catch((error) => {
                this.isLoading = false;
                console.error('Error:', error);
                alert('Произошла ошибка при отправке запроса: ' + error.message);
            });
        },
        updateModelDataType1(words) {
            this.word11 = words[0]
            this.word12 = words[1]
        },
        updateModelDataType2(params) {
            this.word21 = params[0].join('')
            this.word22 = params[1].join('')
            this.countLetters1 = []
            this.countLetters2 = []
            for (let i = 0; i < params[0].length; ++i) {
                this.countLetters1.push(params[0][i].length)
                this.countLetters2.push(params[1][i].length)
            }
        },
        updateModelDataType3(params) {
            this.word31 = params[0]
            this.word32 = params[1]
            this.lengths1 = []
            this.lengths2 = []
            for (let i = 0; i < params[2].length; ++i) {
                this.lengths1.push(params[2][i])
                this.lengths2.push(params[3][i])
            }
        },
        updatePlatformData(params) {
            this.height = params[0]
            this.offset = params[1]
        }
    },
    template: `
        <div>
            <model-types @update:modelType="selectedModelType = $event"></model-types>
            <data-model-type1 v-show="selectedModelType == 1" @update:modelDataType1="updateModelDataType1($event)"></data-model-type1>
            <data-model-type2 v-show="selectedModelType == 2" @update:modelDataType2="updateModelDataType2($event)"></data-model-type2>
            <data-model-type3 v-show="selectedModelType == 3" @update:modelDataType3="updateModelDataType3($event)"></data-model-type3>
            
            <platform-types @update:platformType="selectedPlatformType = $event"></platform-types>
            <data-platform v-show="selectedPlatformType != 0" @update:platformData="updatePlatformData($event)"></data-platform>
            
            <expansion-types @update:expansionType="selectedExpansionType = $event"></expansion-types>
            <div class="action-buttons">
                <button @click="startGeneration" :disabled="isLoading">Запустить генерацию</button>
                <div v-if="isLoading" class="loader">Создание модели...</div>
            </div>
        </div>
        
    `
});
