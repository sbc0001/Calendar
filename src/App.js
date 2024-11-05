import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import './App.css';

const EmptyDay = styled.div`border:1px solid #aaa; padding:10px;`;
const CalendarContainer = styled.div`max-width:800px; margin:10px auto; font-family:'맑은 고딕', Arial, sans-serif; border:1px solid #333; padding:10px; box-shadow:8px 8px 2px rgba(22,33,44,0.4);`;
const CalendarHeader = styled.div`display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;`;
const DaysGrid = styled.div`display:grid; grid-template-columns:repeat(7,1fr); gap:5px;`;
const DayName = styled.div`text-align:center; border-radius:6px; font-weight:bold; padding:5px; background-color:#efd; color:#333; border:1px solid #333;`;
const Day = styled.div`
  border:1px solid #333;  
  border-radius:6px;  
  padding:10px;  
  text-align:center;  
  cursor:pointer;
  background-color: ${({ $isSelected }) => $isSelected ? 'rgba(39,29,200,0.4)' : '#fceced'};
  font-weight: ${({ $isSelected }) => $isSelected ? 'bold' : 'normal'};   
  position:relative;  
  &:hover{background-color:#ddd; 
  font-weight:bold;}
`;
const TodoIndicator = styled.div`position:absolute;  top:5px;  right:5px;  background-color:#ff30cd;  color:#fff;  border-radius:50%;  width:20px;  height:20px;  font-size:12px;  display:flex;  align-items:center;  justify-content:center;`;
const Button = styled.button`background-color:#edc;  color:#333;  border:1px solid #333;  border-radius:12px;  padding:5px 10px;  cursor:pointer;  margin:0 5px;  &:hover{    background-color:#eda;    color:#333;    border:2px solid #333;    font-weight:bold;  }`;
const MonthSelect = styled.select`font-size:1rem;  font-weight:bold;  padding:7px 10px;  margin:0 10px;  border-radius:8px;`;

const CalendarTodo = () => {
  const { year, month } = useParams();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(null);
  const [todos, setTodos] = useState({});
  const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);

  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem('todos')) || {};
    setTodos(savedTodos);
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const daysPerMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const clickDate = (day) => {
    const dateString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
    setSelectedDate(dateString);
  };

  const renderCalendar = () => {
    const blanks = Array(firstDay).fill(null);
    const currentDays = Array.from({ length: daysPerMonth }, (_, i) => i + 1);
    const allDays = [...blanks, ...currentDays];

    return allDays.map((day, index) => {
      if (day === null) return <EmptyDay key={index} />;
      const dateString = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
      const isSelected = selectedDate === dateString;
      const todoForDay = todos[dateString] || [];

      return (
        <Day key={index} $isSelected={isSelected} onClick={() => clickDate(day)}>
          {day}
          {todoForDay.length > 0 && <TodoIndicator>{todoForDay.length}</TodoIndicator>}
        </Day>
      );
    });
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1);
    navigate(`/calendar/${newDate.getFullYear()}/${newDate.getMonth() + 1}`);
  };

  const selectMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    navigate(`/calendar/${currentDate.getFullYear()}/${newMonth}`);
  };

  return (
    <CalendarContainer>
      <CalendarHeader>
        <Button onClick={() => changeMonth(-1)}>이전 달</Button>
        <h2>{currentDate.getFullYear()} 년</h2>
        <MonthSelect value={currentDate.getMonth() + 1} onChange={selectMonthChange}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>{month} 월</option>
          ))}
        </MonthSelect>
        <Button onClick={() => changeMonth(1)}>다음 달</Button>
      </CalendarHeader>
      <DaysGrid>
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <DayName key={day}>{day}</DayName>
        ))}
        {renderCalendar()}
      </DaysGrid>
    </CalendarContainer>
  );
};

const CalculateCountdown = () => {
  const [countdown, setCountdown] = useState('날짜를 선택해주세요.');
  const [selectedDate, setSelectedDate] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && selectedDate) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const timeDifference = selectedDate - now;

        if (timeDifference <= 0) {
          setCountdown('선택한 날짜가 지났습니다');
          setIsRunning(false);
          return;
        }

        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        setCountdown(`- ${days}일 ${hours}시간 ${minutes}분 ${seconds}초`);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, selectedDate]);

  const handleDateChange = (e) => {
    const date = new Date(e.target.value).getTime();
    if (!isNaN(date)) {
      setSelectedDate(date);
      setIsRunning(true);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setCountdown('D-day 계산을 정지하였습니다.');
  };

  return (
    <div id='section'>
      <div className='container'>
        <h2>Day Choice</h2>
        <input type='date' onChange={handleDateChange} />
        <div>{countdown}</div>
        <button onClick={handleStop}>stop</button>
      </div>
      <WorldClock />
    </div>
  );
};

const WorldClock = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [timeDiff, setTimeDiff] = useState('');
  const [selectedCity, setSelectedCity] = useState('America/New_York');

  useEffect(() => {
    const updateClock = () => {
      const date = new Date();
      const localTime = date.getTime();
      const localOffset = date.getTimezoneOffset() * 60000;
      
      try {
        const targetDate = new Date(date.toLocaleString('en-US', { timeZone: selectedCity }));
        
        const digitalTime = targetDate.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
        
        setCurrentTime(digitalTime);
        
        const targetTime = targetDate.getTime();
        const diffHours = (targetTime - localTime) / (1000 * 60 * 60);
        const sign = diffHours >= 0 ? '+' : '';
        setTimeDiff(`한국 시간과의 시차: ${sign} ${diffHours.toFixed(1)} 시간`);
      } catch (error) {
        console.error('Error updating clock:', error);
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    
    return () => clearInterval(interval);
  }, [selectedCity]);

  return (
    <div className='container'>
      <h2> World Clock </h2>
      <select 
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
      >
        <option value="Asia/Seoul">서울</option>
        <option value="America/New_York">뉴욕</option>
        <option value="Europe/London">런던</option>
        <option value="Europe/Paris">파리</option>
        <option value="Australia/Sydney">시드니</option>
        <option value="Asia/Dubai">두바이</option>
        <option value="Asia/Tokyo">도쿄</option>
      </select>
      <div className="time-info">
        <div className="digital-time">{currentTime}</div>
        <div className="time-diff">{timeDiff}</div>
      </div>
    </div>
  );
};

const IntroPage = () => {
  return (
    <div>
      <h2>달력과 남은 시간을 계산합니다.</h2>
      <p>D-day 계산과 세계 시계 기능을 이용할 수 있습니다.</p>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to='/'>Intro</Link></li>
            <li><Link to='/calendar/2024/10'>Calendar</Link></li>
            <li><Link to='/d-day'>D-day Count</Link></li>
          </ul>
        </nav>
      </div>
      <Routes>
        <Route exact path='/' element={<IntroPage/>}/>
        <Route exact path='/d-day' element={<CalculateCountdown/>}/>
        <Route exact path='/calendar/:year/:month' element={<CalendarTodo/>}/>
      </Routes>
    </Router>
  );
}

export default App;