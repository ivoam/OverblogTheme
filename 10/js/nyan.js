YUI().add('nyancat', function(Y)
{
    
    var
    
    STARS_SEED = 200,
    SKY_SPEED = 50,
    
    CAT_SPEED = 20,
    CAT_STRESS = 50,
    
    controller = new Y.Router();
    
    NyanCatView = function(config)
    {
        NyanCatView.superclass.constructor.apply(this, arguments);
    },
    NyanCatWidget = function(config)
    {
        NyanCatWidget.superclass.constructor.apply(this, arguments);
    };
    
    Y.NyanCatView = Y.extend(NyanCatView, Y.View, {
        
        _stars: null,
        
        template:
'<div>'+
'   <div class="sky"></div>'+
'   <div class="nyans"></div>'+
'   <p class="loadmoar">Load moar catz…</p>'+
'   <p class="backhome">Load other catz…</p>'+
'</div>',
        templateStar:
'<div class="star">'+
'</div>',
        
        render: function()
        {
            this.renderUI();
            this.bindUI();
            this.syncUI();
            
            return this.get('container');
        },
        
        renderUI: function()
        {
            var star, i, sky;
            
            this._stars = [];
            
            /**
             * Render stars sky
             */
            this.get('container').append(
                Y.Node.create(
                    this.template
                )
            );
            
            sky = this.get('container').one('.sky');
            
            for (i = 0; i < 6; i++)
            {
                star = Y.Node.create(
                    this.templateStar
                );
                star.addClass('star'+i);
                star.addClass('step'+i);
                sky.append(
                    star
                );
                this._stars.push(star);
            }
            
            /**
             * Set stars animation
             */
            Y.later(
                STARS_SEED,
                this,
                this._animStars,
                null,
                true
            );
            
            /**
             * Make sky scrolling
             */
            Y.later(
                SKY_SPEED,
                this,
                this._animSky,
                null,
                true
            );
            
            if (controller.getPath() == '/')
            {
                this.get('container').one('.backhome').hide();
            }
            else
            {
                this.get('container').one('.loadmoar').hide();
            }
        },
        
        bindUI: function()
        {
            this.get('container').one('.loadmoar').on(
                'click',
                this._loadMoarCatz,
                this
            );
            Y.all([
                this.get('container').one('.backhome')
            ]).on(
                'click',
                function()
                {
                    if (window.location.pathname !== '/')
                    {
                        window.location.href = '/';
                    }
                }
            );
        },
        
        syncUI: function()
        {
            this._loadMoarCatz();
        },
        
        /**
         * Anim star by changing step class
         * @method _animStars
         * @private
         */
        _animStars: function()
        {
            Y.Array.each(
                this._stars,
                function(s)
                {
                    var c = s.get('className').match(/step([0-6])/),
                        step = c[1];
                    
                    s.removeClass('step'+step);
                    
                    step++;
                    if (step > 5)
                    {
                        step = 0;
                    }
                    
                    s.addClass('step'+step);
                }
            );
        },
        _animSky: function()
        {
            Y.Array.each(
                this._stars,
                function(s)
                {
                    var reg = s.get('region'),
                        left = reg.left - 30;
                    
                    if (left < -reg.width)
                    {
                        left = s.get('viewportRegion').right + reg.width;
                    }
                    
                    s.setStyle(
                        'left',
                        left+'px'
                    );
                }
            );
        },
        _loadMoarCatz: function()
        {
            var posts = this.get('posts'),
                perpage = this.get('perpage'),
                nyans = this.get('container').one('.nyans'),
                i = 0,
                page = 1;

            posts.some(
                function(p)
                {
                    if (!p.widget)
                    {
                        p.widget = new Y.NyanCatWidget({
                            date: p.date,
                            author: p.author,
                            title: p.title,
                            body: p.body,
                            url: p.url,
                            tags: p.tags,
                            comments: p.comments
                        });
                        p.widget.render(nyans);
                        i++;
                        
                        if (i > 5)
                        {
                            return true;
                        }
                    }
                }
            );
            
            if (i === 0)
            {
                if ((posts.size()) % perpage !== 0)
                {
                    // No more catz
                    this.get('container').one('.loadmoar').hide();
                    return;
                }
                page = parseInt((posts.size())/perpage+1);
                
                Y.io(
                    page > 1 ? ('/page/' + page) : '/',
                    {
                        on: {
                            success: function(id, data)
                            {
                                var data = data.responseText.replace(/\n/g, ''),
                                    posts = this.get('posts'),
                                    newposts;
                                
                                data = data.match(
                                    /\/\*START\*\/(.*?)\/\*END\*\//
                                );
                                
                                if (data)
                                {
                                    data = data[1].replace(/\s+/g, ' ')
                                                  .replace(/,\s?\]/g, ']');
                                }
                                
                                Y.Array.each(
                                    data.match(/:\s'(.*?)'/g),
                                    function(m)
                                    {
                                        m = m.match(/:\s'(.*?)'/);
                                        
                                        data = data.replace(
                                            new RegExp(
                                                m[0].replace(/\//g, '\\/')
                                            ),
                                            ': "'+m[1].replace(/"/g, '\\"')+'"'
                                        );
                                    }
                                );
                                
                                try
                                {
                                    newposts = Y.JSON.parse(data);
                                    if (!Y.Lang.isArray(newposts))
                                    {
                                        throw new Error('nyan');
                                    }
                                }
                                catch (e)
                                {
                                    console.error(e);
                                    
                                    return;
                                }
                                if (newposts.length > 0)
                                {
                                    Y.Array.each(
                                        newposts,
                                        function(p)
                                        {
                                            posts.add(p);
                                        }
                                    );
                                    this._loadMoarCatz();
                                }
                            }
                        },
                        context: this
                    }
                );
            }
        }
    },
    {
        NAME: 'NyanCatView',
        ATTRS: {
            posts: {
                valueFn: function()
                {
                    return new Y.ArrayList();
                },
                validator: function(v)
                {
                    return Y.Lang.isArray(v);
                },
                setter: function(v)
                {
                    var posts = this.get('posts') || new Y.ArrayList();
                    
                    posts.each(
                        function(p)
                        {
                            p.widget.destroy();
                        }
                    );
                    posts.remove(null, true);
                    
                    posts._items = v;
                    return posts;
                }
            },
            perpage: {
                value: 10,
                validator: function(v)
                {
                    return Y.Lang.isNumber(parseInt(v));
                },
                setter: function(v)
                {
                    return parseInt(v);
                }
            }
        }
    });
    
    Y.NyanCatWidget = Y.extend(NyanCatWidget, Y.Widget, {
        initializer: function(config)
        {
            this.set('date', config.date);
        },
        
        template:
'<div class="nyan step1">'+
'   <div class="content">'+
'       <h2 class="title">{title}</h2>'+
'   </div>'+
'</div>',
        
        renderUI: function()
        {
            var cb = this.get('contentBox'),
                node = Y.Node.create(
                    Y.substitute(
                        this.template,
                        {
                            title: this.get('title'),
                            body: this.get('body').replace(
                                /<\/?[a-z0-6]+>/g, '').substring(0,100)
                        }
                    )
                ),
                reg;
            
            cb.append(node);
            
            /**
             * check current url and display post if match
             */
            if (window.location.pathname === this.get('url'))
            {
                this._displayPost();
            }
        },
        bindUI: function()
        {
            this.after(
                'render',
                function()
                {
                    Y.later(
                        1,
                        this,
                        this._randomizeDimensions
                    );
                },
                this
            );
            
            this.get('contentBox').on(
                'mouseenter',
                function(e)
                {
                    this._hovered = true;
                },
                this
            );
            this.get('contentBox').on(
                'mouseleave',
                function(e)
                {
                    this._hovered = false;
                },
                this
            );
            
            this.get('contentBox').on(
                'click',
                this._displayPost,
                this
            );
        },
        
        _speed: 0,
        _randomizeDimensions: function()
        {
            var node = this.get('contentBox').one('.nyan'),
                reg = node.get('region'),
                ratio = Math.max(.5,Math.random()),
                top = Math.random()*70;
            
            node.setStyles({
                width: reg.width * ratio + 'px',
                height: reg.height * ratio + 'px',
                top: top+'%',
                opacity: ratio,
                zIndex: parseInt(ratio*100)
            })
            
            this._speed = Math.max(
                .1,
                Math.random()
            );
            
            Y.later(
                CAT_SPEED,
                this,
                this._movingCat,
                null,
                true
            );
            Y.later(
                CAT_STRESS,
                this,
                this._animCat,
                null,
                true
            );
        },
        
        _movingCat: function()
        {
            if (this._hovered)
            {
                return;
            }
            var node = this.get('contentBox').one('.nyan'),
                reg = node.get('region'),
                left = reg.left + 20 * this._speed;
            
            if (left > node.get('viewportRegion').right)
            {
                left = -reg.width;
            }
            
            node.setStyle(
                'left',
                left+'px'
            );
        },
        _animCat: function()
        {
            var node = this.get('contentBox').one('.nyan'),
                c = node.get('className').match(/step([0-6])/);
            
            c = c[1];
            
            node.removeClass('step'+c);
            
            c++;
            if (c > 6)
            {
                c = 1;
            }
            
            node.addClass('step'+c);
        },
        
        _displayPost: function()
        {
            var date = Y.DataType.Date.format(
                    this.get('date'),
                    {
                        format: 'le %A, %e %B %Y à %H:%M'
                    }
                ),
                currentUrl = controller.getPath(),
                p = new Y.Panel({
                    headerContent: Y.Node.create(
                        '<h2>'+this.get('title')+'</h2>'+
                        '<p class="details">'+this.get('author')+
                        ' a nyané ça '+date+'</p>'
                    ),
                    bodyContent: Y.Node.create(
                        '<div class="post">'+
                        this.get('body')+
                        '</div>'+
                        '<div class="comments">'+
                        '<h3>Lache un nyan !</h3>'+
                        this.get('comments')+
                        '</div>'
                    ),
                    modal: true,
                    centered: true,
                    width: Y.one('body').get('viewportRegion').width / 1.6,
                    height: Y.one('body').get('viewportRegion').height / 1.1,
                    render: true,
                    zIndex: 999,
                    hideOn: [{
                        eventName: 'clickoutside'
                    }]
                });
            
            p.after(
                'visibleChange',
                function()
                {
                    // Come back to previous url
                    controller.save(currentUrl);
                    
                    // Destroy panel
                    Y.later(
                        1,
                        this,
                        this.destroy
                    );
                },
                p,
                currentUrl
            );
            controller.save(this.get('url'));
        }
    },
    {
        NAME: 'NyanCatWidget',
        ATTRS: {
            date: {
                setter: function(v)
                {
                    var date,
                        match = v.match(
                        /([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2}):([0-9]{2})/
                    );
                    
                    try
                    {
                        date = new Date(
                            match[1],
                            match[2],
                            match[3],
                            match[4],
                            match[5],
                            match[6]
                        );
                    }
                    catch (e)
                    {
                        throw new Error('Date format is invalid');
                    }
                    
                    return date;
                }
            },
            author: {
                value: '',
                validator: function(v)
                {
                    return Y.Lang.isString(v);
                }
            },
            title: {
                value: '',
                validator: function(v)
                {
                    return Y.Lang.isString(v);
                }
            },
            body: {
                value: '',
                validator: function(v)
                {
                    return Y.Lang.isString(v);
                }
            },
            url: {
                value: ''
            },
            tags: {
                setter: function(v)
                {
                    var tags = this.get('tags') || new Y.ArrayList();
                    
                    tags.remove(null, true);
                    
                    tags._items = v;
                    return tags;
                }
            },
            comments: {
                value: ''
            }
        }
    });
});