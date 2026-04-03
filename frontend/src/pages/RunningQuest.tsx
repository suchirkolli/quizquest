import {Link, useLocation, useNavigate} from 'react-router-dom';
import type {Quest, Question} from '../types/Quest';
import {useParams} from 'react-router-dom';
import {useEffect, useState} from 'react';



function RunningQuest(){
    const navigate = useNavigate();
    const location = useLocation();
    const {id} = useParams();
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [message, setMessage] = useState('');

useEffect(() => {
async function GetQuest() {
    if (!id){return false;}
    const connect = await fetch('http://localhost:5000/api/quests/${id}');
    const data = await connect.json();
    if (!connect.ok){
        setMessage("Load Error");
        return;
    }
    setTitle(data.title);

}})}