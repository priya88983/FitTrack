import React, { useState } from "react";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #e3f2fd, #f0f8ff, #e6f7ff);
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
  margin-top:2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(0, 100, 200, 0.15);
  padding: 40px;
  width: 100%;
  max-width: 900px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  animation: ${fadeIn} 0.8s ease-out;
  border: 1px solid rgba(25, 118, 210, 0.1);
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    clip-path: polygon(100% 0, 100% 100%, 0 100%);
    z-index: 0;
  }
`;

const Title = styled.h2`
  font-size: 42px;
  color: #1976d2;
  font-weight: 800;
  margin-bottom: 30px;
  grid-column: span 2;
  text-align: center;
  letter-spacing: -0.5px;
  position: relative;
  z-index: 1;

  &:after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #42a5f5, #1976d2);
    border-radius: 2px;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  position: relative;
  z-index: 1;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: #f5fbff;
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(25, 118, 210, 0.1);
  cursor: pointer;

  &:hover {
    background: #e3f2fd;
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(25, 118, 210, 0.1);
  }
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42a5f5, #1976d2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: ${pulse} 4s infinite;
  color: white;
  font-size: 20px;
`;

const ContactText = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContactType = styled.span`
  font-size: 14px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 5px;
`;

const ContactValue = styled.span`
  font-size: 18px;
  color: #1976d2;
  font-weight: 600;
`;

const ContactLink = styled.a`
  color: #1976d2;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 600;

  &:hover {
    color: #0d47a1;
    text-decoration: underline;
  }
`;

const MapContainer = styled.div`
  grid-column: span 2;
  background: #f5fbff;
  border-radius: 16px;
  overflow: hidden;
  height: 300px;
  position: relative;
  border: 1px solid rgba(25, 118, 210, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const MapFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const SocialSection = styled.div`
  grid-column: span 2;
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
  position: relative;
  z-index: 1;
`;

const SocialIcon = styled.a`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1976d2;
  font-size: 22px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: linear-gradient(135deg, #42a5f5, #1976d2);
    color: white;
    box-shadow: 0 5px 15px rgba(25, 118, 210, 0.2);
  }
`;

const HoursSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  position: relative;
  z-index: 1;
`;

const HoursItem = styled.div`
  padding: 20px;
  background: #f5fbff;
  border-radius: 16px;
  border: 1px solid rgba(25, 118, 210, 0.1);
`;

const HoursTitle = styled.h3`
  font-size: 20px;
  color: #1976d2;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;

  &:before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #1976d2;
  }
`;

const HoursRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(25, 118, 210, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const Day = styled.span`
  color: #555;
`;

const Time = styled.span`
  color: #1976d2;
  font-weight: 500;
`;

const CopyNotification = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #1976d2;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

const ContactHeader = styled.div`
  grid-column: span 2;
  text-align: center;
  color: #555;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
`;

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container>
      <CopyNotification show={copied}>Copied to clipboard!</CopyNotification>

      <Card>
        <Title>Contact Us</Title>

        <ContactHeader>
          Reach out to us through any of these channels
        </ContactHeader>

        <ContactInfo>
          <ContactItem onClick={() => copyToClipboard("+1 (555) 123-4567")}>
            <IconWrapper>📱</IconWrapper>
            <ContactText>
              <ContactType>Mobile</ContactType>
              <ContactValue>+1 (555) 123-4567</ContactValue>
            </ContactText>
          </ContactItem>

          <ContactItem onClick={() => copyToClipboard("+1 (555) 987-6543")}>
            <IconWrapper>📞</IconWrapper>
            <ContactText>
              <ContactType>Office</ContactType>
              <ContactValue>+1 (555) 987-6543</ContactValue>
            </ContactText>
          </ContactItem>

          <ContactItem>
            <IconWrapper>✉️</IconWrapper>
            <ContactText>
              <ContactType>Email</ContactType>
              <ContactValue>
                <ContactLink href="mailto:contact@skyblue.com">
                  contact@skyblue.com
                </ContactLink>
              </ContactValue>
            </ContactText>
          </ContactItem>

          <ContactItem>
            <IconWrapper>📍</IconWrapper>
            <ContactText>
              <ContactType>Location</ContactType>
              <ContactValue>123 Skyline Blvd, Cloud City</ContactValue>
            </ContactText>
          </ContactItem>
        </ContactInfo>

        <HoursSection>
          <HoursItem>
            <HoursTitle>Working Hours</HoursTitle>
            <HoursRow>
              <Day>Monday - Friday</Day>
              <Time>8:00 AM - 6:00 PM</Time>
            </HoursRow>
            <HoursRow>
              <Day>Saturday</Day>
              <Time>9:00 AM - 4:00 PM</Time>
            </HoursRow>
            <HoursRow>
              <Day>Sunday</Day>
              <Time>Closed</Time>
            </HoursRow>
          </HoursItem>

          <HoursItem>
            <HoursTitle>Customer Support</HoursTitle>
            <HoursRow>
              <Day>24/7 Hotline</Day>
              <Time>+1 (800) SKY-BLUE</Time>
            </HoursRow>
            <HoursRow>
              <Day>Email</Day>
              <Time>
                <ContactLink href="mailto:support@skyblue.com">
                  support@skyblue.com
                </ContactLink>
              </Time>
            </HoursRow>
          </HoursItem>
        </HoursSection>

        <MapContainer>
          <MapFrame
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184133404772!2d-73.98757492357558!3d40.75802887138786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1718181496247!5m2!1sen!2sus"
            allowFullScreen
            loading="lazy"
            title="SkyBlue Headquarters Location"
          />
        </MapContainer>

        <SocialSection>
          <SocialIcon href="#" target="_blank">
            <i className="fab fa-facebook-f"></i>
          </SocialIcon>
          <SocialIcon href="#" target="_blank">
            <i className="fab fa-twitter"></i>
          </SocialIcon>
          <SocialIcon href="#" target="_blank">
            <i className="fab fa-instagram"></i>
          </SocialIcon>
          <SocialIcon href="#" target="_blank">
            <i className="fab fa-linkedin-in"></i>
          </SocialIcon>
        </SocialSection>
      </Card>
    </Container>
  );
};

export default Contact;
