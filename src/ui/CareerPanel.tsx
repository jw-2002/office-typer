// The career program: your job, how far you are from the next promotion, and the whole ladder of jobs.
import { achievements } from "@/game/data/achievements";
import { assignmentTierNames, jobs } from "@/game/data/jobs";
import { LEGACY_BONUS_STEP, formatNumber, legacyMultiplier, promotionProgress } from "@/game/economy";
import { useGameStore } from "@/state/gameStore";
import ProgressBar from "./ProgressBar";
import styles from "./CareerPanel.module.css";

export default function CareerPanel() {
  const totalChars = useGameStore((state) => state.stats.totalChars);
  const legacy = useGameStore((state) => state.legacy);
  const earned = useGameStore((state) => state.achievements);
  const { job, next, fraction, remaining } = promotionProgress(totalChars);
  const currentIndex = jobs.findIndex((candidate) => candidate.id === job.id);

  return (
    <div className={styles.career}>
      <section>
        <h3 className={styles.heading}>Your job</h3>
        <p className={styles.job}>{job.title}</p>
        <p className={styles.detail}>
          Pay x{job.payoutMultiplier} - {assignmentTierNames[job.assignmentTier]}
        </p>

        {legacy > 0 && (
          <p className={styles.detail}>
            Career number {legacy + 1}: +{Math.round((legacyMultiplier(legacy) - 1) * 100)}% pay for your experience (+
            {Math.round(LEGACY_BONUS_STEP * 100)}% for each career, up to ten).
          </p>
        )}

        <h3 className={styles.heading}>Next promotion</h3>
        {next ? (
          <>
            <ProgressBar value={fraction} label={`Progress to ${next.title}`} />
            <p className={styles.detail}>
              {formatNumber(remaining)} more characters to be a {next.title} (pay x{next.payoutMultiplier})
            </p>
          </>
        ) : (
          <p className={styles.detail}>You have reached the top of the ladder. Nowhere higher to go.</p>
        )}
      </section>

      <section className={styles.wide}>
        <h3 className={styles.heading}>
          Achievements ({earned.length} of {achievements.length})
        </h3>
        <ul className={styles.achievements}>
          {achievements.map((achievement) => (
            <li
              key={achievement.id}
              className={styles.achievement}
              data-earned={earned.includes(achievement.id)}
              title={achievement.description}
            >
              <strong>{achievement.name}</strong>
              <span>{achievement.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className={styles.heading}>The ladder</h3>
        <ol className={styles.ladder}>
          {jobs.map((rung, index) => (
            <li
              key={rung.id}
              className={styles.rung}
              data-state={index < currentIndex ? "done" : index === currentIndex ? "current" : "todo"}
            >
              <span>{rung.title}</span>
              <span className={styles.chars}>{formatNumber(rung.minChars)}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
