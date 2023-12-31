class fullSwipter {
  constructor(props) {
    this.state = {
      id: props.id,
      duration: props.duration,
      isShowPagination: props.isShowPagination,

      index: 0,
      isLock: false,
      translateX: 0,
      defaultLength: null,
      itemWidth: null,
      _swiperList: null,
    };

    this._$ = selector => document.querySelector(selector);
    this._createElement = type => document.createElement(type);
    this._setContent = (elem, content) => elem.innerHTML = content;
    this._appendChild = (container, node) => container.append(node);
    this.addHTML()
  }

  addHTML() {
    let $ = this._$;
    let idContatiner = $(`#${this.state.id}`);
    // 初始化
    this.state._swiperList = idContatiner.querySelector('#swiper-list');
    let swiperItem = this.state._swiperList.querySelectorAll('.swiper-item')
    this.state.defaultLength = swiperItem.length;

    let swiperPagination = this._createElement('div');
    let swiperPaginationItem = this._createElement('span');
    // let swiperPaginationItemActive = this._createElement('span');
    let swiperArrowL = this._createElement('a');
    let swiperArrowR = this._createElement('a');

    swiperArrowL.setAttribute('class', 'swiper-arrow swiper-arrow-left')
    swiperArrowR.setAttribute('class', 'swiper-arrow swiper-arrow-right')
    swiperArrowL.setAttribute('id', 'swiper-prev')
    swiperArrowR.setAttribute('id', 'swiper-next')

    this._setContent(swiperArrowL, '&lt;')
    this._setContent(swiperArrowR, '&gt;')

    if (this.state.isShowPagination) {
      swiperPagination.setAttribute('class', 'swiper-pagination')
      swiperPaginationItem.setAttribute('class', 'swiper-pagination-switch')
      // 动态加入小指示圆点
      for (let i = 0; i < this.state.defaultLength; i++) {
        let tran = swiperPaginationItem.cloneNode()
        if (i === 0) {
          tran.setAttribute('class', 'swiper-pagination-switch active')
        } else {
          tran.setAttribute('class', 'swiper-pagination-switch')
        }
        this._appendChild(swiperPagination, tran)
        this._appendChild(idContatiner, swiperPagination)
      }
    }

    this._appendChild(idContatiner, swiperArrowL)
    this._appendChild(idContatiner, swiperArrowR)

    swiperArrowL.addEventListener('click', this.swiperPrev.bind(this))
    swiperArrowR.addEventListener('click', this.swiperNext.bind(this))

    let swiperSwitch = this.state._swiperList.parentNode.querySelectorAll('.swiper-pagination-switch');
    for (let i = 0; i < swiperSwitch.length; i++) {
      swiperSwitch[i].setAttribute('data-index', i);
      swiperSwitch[i].addEventListener('click', this.swiperSwitch.bind(this));
    }

    window.addEventListener('resize', this.swiperReset.bind(this))

    this.clone()
  }

  animateTo(begin, end, duration, changeCallback, finishCallback) {
    let startTime = Date.now();
    let that = this
    requestAnimationFrame(function update() {
      let dataNow = Date.now();
      let time = dataNow - startTime;
      let value = that.linear(time, begin, end, duration);
      typeof changeCallback === 'function' && changeCallback(value)
      if (startTime + duration > dataNow) {
        requestAnimationFrame(update)
      } else {
        typeof finishCallback === 'function' && finishCallback(end)
      }
    })
  }

  linear(time, begin, end, duration) {
    return (end - begin) * time / duration + begin
  }

  clone() {
    let swiperItem = this.state._swiperList.querySelectorAll('.swiper-item');
    let firstItem = swiperItem[0].cloneNode('deep');
    let lastItem = swiperItem[swiperItem.length - 1].cloneNode('deep');

    let swiperList = this.state._swiperList
    let index = this.state.index;
    let swiperItemWidth = swiperList.offsetWidth;


    this.state.itemWidth = swiperItemWidth;
    this.state.translateX = - (swiperItemWidth + swiperItemWidth * index);

    swiperList.appendChild(firstItem)
    swiperList.prepend(lastItem)

    this.goIndex(index)
  }
  goIndex(index) {
    let swiperDuration = this.state.duration;
    let swiperItemWidth = this.state.itemWidth;
    let beginTranslateX = this.state.translateX;

    let endTranslateX = - (swiperItemWidth + swiperItemWidth * index)
    let swiperList = this.state._swiperList
    let isLock = this.state.isLock;

    if (isLock) return

    this.state.isLock = true

    let that = this;
    this.animateTo(beginTranslateX, endTranslateX, swiperDuration, function (value) {
      swiperList.style.transform = `translateX(${value}px)`;
    }, function (value) {
      // 1. 在动画回调完成时候，获取默认的项目长度
      let swiperLength = that.state.defaultLength;
      // 2. 如果当前索引为 -1 时，也是就滑动到我们 clone 的最后一项
      if (index === -1) {
        // 3. 重设索引为最后一项，并重新计算偏移量
        index = swiperLength - 1;
        value = - (swiperItemWidth + swiperItemWidth * index);
      }
      // 4. 如果当前索引为项目长度，也就是滑动到我们 clone 的第一项
      if (index === swiperLength) {
        // 5. 重设索引为第 0 项目，并重新计算偏移量
        index = 0;
        value = - (swiperItemWidth + swiperItemWidth * index);
      }

      swiperList.style.transform = `translateX(${value}px)`
      that.state.index = index;
      that.state.translateX = value;

      that.state.isLock = false

      // 显示指示按钮，才进行高亮操作
      that.state.isShowPagination && that.hightlight(index)

    })
  }
  swiperPrev() {
    let index = this.state.index;
    this.goIndex(index - 1);
  }
  swiperNext() {
    let index = this.state.index;
    this.goIndex(index + 1);
  }
  swiperSwitch(e) {
    let index = e.target.dataset.index;
    index = Number(index)
    this.goIndex(index)
  }

  hightlight(index) {
    // 将目前显示的按钮，高亮
    let swiperItem = this.state._swiperList.parentNode.querySelectorAll('.swiper-pagination-switch');
    for (let i = 0; i < swiperItem.length; i++) {
      swiperItem[i].className = 'swiper-pagination-switch';
    }
    swiperItem[index].className = 'swiper-pagination-switch active';
  }
  swiperReset() {
    let swiperList = this.state._swiperList
    let swiperItemWidth = swiperList.offsetWidth;
    let index = this.state.index;

    let translateX = - (swiperItemWidth + swiperItemWidth * index);
    // 5. 重设 PAGE.data 中的偏移量和宽度
    this.state.itemWidth = swiperItemWidth;
    this.state.translateX = translateX;
    // 6. 设置页面的偏移量
    swiperList.style.transform = `translateX(${translateX}px)`;
  }
}

const PAGE = {
  data: {
    swiper__1: null,
    swiper__2: null,
  },
  init: function () {
    this.initSwiper();
  },
  initSwiper: function () {
    PAGE.data.swiper__1 = new fullSwipter({
      id: 'swiper-wrapper__1',
      duration: 500,
      isShowPagination: true,
      // index: 0,
      // isLock: false,
      // translateX: 0,
      // defaultLength: null,
      // itemWidth: null,
      change: function (val) {
        console.log(val)
      },
    })

    PAGE.data.swiper__2 = new fullSwipter({
      id: 'swiper-wrapper__2',
      duration: 1000,
      isShowPagination: true,
      change: function (val) {
        console.log(val)
      },
    })

    PAGE.data.swiper__3 = new fullSwipter({
      id: 'swiper-wrapper__3',
      duration: 300,
      isShowPagination: false,
      change: function (val) {
        console.log(val)
      },
    })
  }
}

PAGE.init()