import React from 'react';

const OUTCOME_MESSAGES = {
  collision: "Diqqat: To'qnashuv yuz berdi!",
  priority_violation: "Xato: Asosiy yo'ldagi transportga yo'l berilmadi!",
  sign_violation: "Xato: Yo'l belgisi talabi buzildi!",
  marking_violation: "Xato: Yo'l chizig'i talabi buzildi!",
  unnecessary_wait: "Xato: Imtiyozga ega bo'lsangiz ham bekorga kutdingiz!",
  unsafe_but_legal: "Ogohlantirish: Xavfsizlik chegarasi past, ammo qoida buzilmadi.",
};

const OUTCOME_DETAILS = {
  collision: "Animatsiyada qizil ramka bilan to'qnashuv nuqtasi ko'rsatildi.",
  priority_violation: "Animatsiyada xato manevr ko'rsatildi. Iltimos, xavfsizlik qoidasiga va o'tish ketma-ketligiga e'tibor qarating!",
  sign_violation: "Belgi talabiga rioya qilish kerak edi.",
  marking_violation: "Yo'l chizig'i talabiga rioya qilish kerak edi.",
  unnecessary_wait: "Sizning imtiyozi borligingizni unutmang.",
  unsafe_but_legal: "Xavfsiz masofani saqlashga harakat qiling.",
};

export function OutcomeBanner({ userResult }) {
  if (!userResult) return null;

  return (
    <div className={`outcome-banner ${userResult.type}`}>
      {userResult.correct ? (
        <>
          <span>✅</span>
          <div>
            <div>To'g'ri javob!</div>
            <div style={{ fontSize: '12px', fontWeight: 400 }}>
              Chorrahadan xavfsiz va qoidaga muvofiq o'tildi.
            </div>
          </div>
        </>
      ) : (
        <>
          <span>💥</span>
          <div>
            <div>{OUTCOME_MESSAGES[userResult.type] || 'Xato javob!'}</div>
            <div style={{ fontSize: '13px', fontWeight: 500, marginTop: '4px', color: '#cbd5e1' }}>
              {OUTCOME_DETAILS[userResult.type] || ''}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
