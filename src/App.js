import React, { Component } from 'react';
import styled from 'styled-components'
import axios from 'axios';
import uuid from 'uuid/v4';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import io from 'socket.io-client';
import './App.css';
import { endpoint, wss } from "./config";

const Container = styled.div`
    width: 500px;
    margin:0 auto 0 auto   
`;

const getUuid = () => {
    const storageUserId = localStorage.getItem('userId');
    if (storageUserId) {
        return storageUserId
    }

    const id = uuid();
    localStorage.setItem('userId', id);
    return id
};

const socket = io('http://localhost:3007');

class App extends Component {
    state = {
        message: '',
        messages: [],
        userId: getUuid()
    };

    input = React.createRef();

    componentDidMount() {
        this.getMessage();
        this.socketConnections();
    }

    socketConnections = () => {
        socket.on('receivedMessage', ({ message, userId }) => this.setState({
            messages: [
                ...this.state.messages,
                { message, userId }
            ]
        }))
    }

    getMessage = () => {
        axios.get(`${endpoint}/get-messages`)
            .then(({ data }) => this.setState({ messages: data }))
    };

    sendMessage = () => {
        socket.emit('sendMessages', {
            message: this.state.message,
            userId: this.state.userId
        });

        this.setState({
            message: '',
            messages: [
                ...this.state.messages,
                {
                    message: this.state.message,
                    userId: this.state.userId
                }
            ]
        })
    };

    changeMessage = (e) => {
        this.setState({ message: e.target.value });
    };

    render() {
        const { messages, message } = this.state;
        return (
          <Container className="App">
            <Table>
                <TableHead>
                    <TableCell>Сообщение</TableCell>
                    <TableCell>ID</TableCell>
                </TableHead>
              {messages.map(i =>
                  <TableRow>
                      <TableCell>{i.message}</TableCell>
                      <TableCell>{i.userId === this.state.userId ? 'Ваше сообщение' : i.userId}</TableCell>
                  </TableRow>
              )}
            </Table>
            <Input style={{ margin: '15px 15px 0 0' }} ref={this.input} value={message} onChange={this.changeMessage} placeholder="enter your message" />
            <Button variant="raised" color="primary" onClick={this.sendMessage}>send</Button>
          </Container>
    );
    }
}

export default App;
