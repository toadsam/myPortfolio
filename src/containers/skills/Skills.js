import React, {useContext} from "react";
import "./Skills.scss";
import SoftwareSkill from "../../components/softwareSkills/SoftwareSkill";
import {illustration, skillsSection} from "../../portfolio";
import {Fade} from "react-reveal";
import codingPerson from "../../assets/lottie/codingPerson";
import DisplayLottie from "../../components/displayLottie/DisplayLottie";
import StyleContext from "../../contexts/StyleContext";

export default function Skills() {
  const {isDark} = useContext(StyleContext);
  if (!skillsSection.display) {
    return null;
  }
  const renderSkillText = skill => {
    let skillText = null;
    if (typeof skill === "string") {
      skillText = skill;
    } else if (
      Array.isArray(skill) &&
      skill.length > 0 &&
      skill.every(item => typeof item === "string")
    ) {
      skillText = skill.join("");
    }
    if (!skillText) {
      return skill;
    }
    const separatorIndex = skillText.indexOf(":");
    if (separatorIndex === -1) {
      return skillText;
    }
    const label = skillText.slice(0, separatorIndex).trim();
    const detail = skillText.slice(separatorIndex + 1).trim();
    return (
      <>
        <span className="skills-text-label">{label}</span>
        <span className="skills-text-separator">:</span>
        <span className="skills-text-detail"> {detail}</span>
      </>
    );
  };
  return (
    <div className={isDark ? "dark-mode main" : "main"} id="skills">
      <div className="skills-main-div">
        <Fade left duration={1000}>
          <div className="skills-image-div">
            {illustration.animated ? (
              <DisplayLottie animationData={codingPerson} />
            ) : (
              <img
                alt="Man Working"
                src={require("../../assets/images/developerActivity.svg")}
              ></img>
            )}
          </div>
        </Fade>
        <Fade right duration={1000}>
          <div className="skills-text-div">
            <h1
              className={isDark ? "dark-mode skills-heading" : "skills-heading"}
            >
              {skillsSection.title}{" "}
            </h1>
            <p
              className={
                isDark
                  ? "dark-mode subTitle skills-text-subtitle"
                  : "subTitle skills-text-subtitle"
              }
            >
              {skillsSection.subTitle}
            </p>
            <SoftwareSkill />
            <div>
              {skillsSection.skills.map((skills, i) => {
                return (
                  <p
                    key={i}
                    className={
                      isDark
                        ? "dark-mode subTitle skills-text"
                        : "subTitle skills-text"
                    }
                  >
                    {renderSkillText(skills)}
                  </p>
                );
              })}
            </div>
          </div>
        </Fade>
      </div>
    </div>
  );
}
