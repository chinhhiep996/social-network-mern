const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

const replacements = [
    [/from 'material-ui\/styles'/g, "from '@mui/styles'"],
    [/from "material-ui\/styles"/g, "from '@mui/styles'"],
    [/from 'material-ui-icons\/(.*)'/g, "from '@mui/icons-material/$1'"],
    [/from "material-ui-icons\/(.*)"/g, "from '@mui/icons-material/$1'"],
    [/from 'material-ui\/(.*)'/g, "from '@mui/material/$1'"],
    [/from "material-ui\/(.*)"/g, "from '@mui/material/$1'"],
    [/import \{ (.*) \} from 'material-ui'/g, "import { $1 } from '@mui/material'"],
    [/material-ui\/styles/g, "@mui/material/styles"],
    [/material-ui\/colors/g, "@mui/material/colors"],
    [/theme\.spacing\.unit/g, "8"],
    [/type="title"/g, 'variant="h6"'],
    [/type="headline"/g, 'variant="h5"'],
    [/type="body1"/g, 'variant="body1"'],
    [/type="subheading"/g, 'variant="subtitle1"'],
    [/variant="h4"/g, 'variant="h4"'],
    [/GridListTile/g, 'ImageListItem'],
    [/GridList/g, 'ImageList'],
    [/fullWidth/g, 'variant="fullWidth"'],
    [/import \{ (.*) \} from '@mui\/material\/.*'/g, "import { $1 } from '@mui/material'"],
];

['client', 'server'].forEach(dir => {
    walk(dir, (file) => {
        if (file.endsWith('.js')) {
            let content = fs.readFileSync(file, 'utf8');
            let original = content;
            replacements.forEach(([regex, replacement]) => {
                content = content.replace(regex, replacement);
            });
            if (content !== original) {
                console.log(`Updated ${file}`);
                fs.writeFileSync(file, content);
            }
        }
    });
});
