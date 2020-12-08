import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import { makeStyles, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  link_button: {
    textDecoration: 'none'
  },
  row :{
    paddingTop: 10
  }
}));

function Rows(props) {
  const { row } = props;
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  return(
    <React.Fragment >
      <TableRow>
        <TableCell align="left">{row[0]}</TableCell>
        <TableCell align="right">{row[1]}</TableCell>
        <TableCell align="right">{row[2]}</TableCell>
        <TableCell align="right">{row[8]}</TableCell>
        <TableCell align="right">
          <Link className={classes.link_button} to={{ pathname: '/resource/edit', resourceInfo: row }}><Button color="primary">Edit</Button></Link>
          <Button color="secondary" onClick={() => { props.handleRemoveFormOpen(row) }}>Remove</Button>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Typography className={classes.row} variant="h6" gutterBottom component="div">
            Resource Details
                </Typography>
            <Table size="small" aria-label="purchases">
              <TableBody>
                <TableRow>
                  <TableCell>Vault Path: {decodeURIComponent(row[3])}</TableCell>
                  <TableCell>Hostname: {row[4]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Information: {row[5]}</TableCell>
                  <TableCell>Freespace: {row[6]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Comment: {row[7]}</TableCell>
                  <TableCell>Context: {row[9]}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment >
  );
}

export default Rows;