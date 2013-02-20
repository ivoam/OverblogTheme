var

fs = require('fs'),

PATH = __dirname+'/fragments/',
BUILD_PATH = __dirname+'/build/',
STRUCTS = {
	0:0,
	1:1,
	2:2,
	3:3,
	4:4,
	5:5,
	6:1,
	7:2,
	8:3
},

compile = function(struct, fragment)
{
	fragment = fragment || 'theme';

	var tpl = fs.readFileSync(
			PATH+fragment+'.twig'
		).toString(),
		fragments = tpl.match(/\{\$(.*?)\}/g);

	// TPL fragments
	fragments && fragments.forEach(
		function(fragment)
		{
			var fragment = fragment.match(/\{\$(.*?)\}/)[1],
				realfragment = fragment,
				indentation = tpl.match(new RegExp('\\n( +)\\{\\$'+fragment+'\\}'));

			if (indentation && indentation[1])
			{
				indentation = indentation[1];
			}
			else
			{
				indentation = '';
			}

			if ('_line1' === realfragment)
			{
				realfragment = fragment+'_struct'+struct;
			}

			tpl = tpl.replace(
				'{$'+fragment+'}',
				compile(struct, realfragment)
					.replace(
						/\n/g,
						'\n'+
						indentation
					)
					.replace(/\n/g, '\n')
			);
		}
	);

	return tpl;
};

Object.prototype.forEach = function(fn, scope)
{
	scope = scope || this;
	for (var k in this)
	{
		if (scope.hasOwnProperty(k))
	    {
	    	fn(scope[k], k);
	    }
	}
};

STRUCTS.forEach(
	function(v, k)
	{
		var filename = 'struct_'+k+'.twig',
			tpl = compile(v);

		fs.writeFile(
			BUILD_PATH+filename,
			tpl
		);
	}
);
