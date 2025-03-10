// app/api/calculate/route.js
import { connectDB } from "@/lib/mongodb";
import TaxParameter from "@/models/TaxParameter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { year, income } = await request.json();

  const taxParams = await TaxParameter.findOne({
    year,
    userId: session.user.id,
  });
  if (!taxParams) {
    return NextResponse.json(
      { error: "Parameters not found for the given year" },
      { status: 404 }
    );
  }

  const {
    personalAllowance,
    basicRate,
    higherRate,
    additionalRate,
    basicThreshold,
    higherThreshold,
    taperThreshold,
  } = taxParams.incomeTax;

  const {
    primaryThreshold,
    upperEarningsLimit,
    primaryRate,
    upperRate,
    selfPrimaryRate,
    selfUpperRate,
  } = taxParams.nationalInsurance;

  // Ensure valid inputs
  if (income <= 0) {
    return NextResponse.json(
      { error: "Income must be greater than zero." },
      { status: 400 }
    );
  }

  // Tax Calculation Logic
  let taxAt0Percent = 0;
  let taxAt20Percent = 0;
  let taxAt40Percent = 0;
  let taxAt45Percent = 0;
  let taper40 = 0;

  if (income - taperThreshold < 0) {
    taper40 = 0;
  } else {
    taper40 = income - taperThreshold;
  }

  if (income > higherThreshold) {
  } else {
  }

  let calculation = (income - taperThreshold) / 2;
  let adjustedPersonalAllowance = personalAllowance - calculation;

  // This condition assigns a zero amount to the adjusted personal allowance if it is negative else it keeps the adjustment (£2,570 for example)
  if (adjustedPersonalAllowance < 0) {
    adjustedPersonalAllowance = 0;
  } else {
    adjustedPersonalAllowance = adjustedPersonalAllowance;
  }

  let taxableIncome = income - adjustedPersonalAllowance;

  console.log("Income = ", income);
  console.log("taper40 = ", taper40);

  if (income <= personalAllowance) {
    taxAt0Percent = 0;
  } else if (income <= basicThreshold) {
    taxAt0Percent = 0;
    taxAt20Percent = (income - personalAllowance) * basicRate;
  } else if (income < taperThreshold) {
    taxAt0Percent = 0;
    taxAt20Percent = (basicThreshold - personalAllowance) * basicRate;
    taxAt40Percent = (income - basicThreshold) * higherRate;
  } else if (income > higherThreshold) {
    taxAt0Percent = 0;
    taxAt20Percent = (basicThreshold - personalAllowance) * basicRate;
    taxAt40Percent =
      (higherThreshold - (basicThreshold - personalAllowance)) * higherRate;
    taxAt45Percent = (income - higherThreshold) * additionalRate;
  } else {
    taxAt0Percent = 0;
    taxAt20Percent = (basicThreshold - personalAllowance) * basicRate;
    taxAt40Percent =
      (taxableIncome - (basicThreshold - personalAllowance)) * higherRate;
  }

  const totalIncomeTax =
    taxAt0Percent + taxAt20Percent + taxAt40Percent + taxAt45Percent;

  console.log("Income Tax Breakdown: ", {
    taxAt0Percent,
    taxAt20Percent,
    taxAt40Percent,
    taxAt45Percent,
  });
  console.log("Total Income Tax = £", totalIncomeTax);

  // Employed National Insurance Calculation
  let ni = 0;
  if (income > primaryThreshold) {
    ni =
      (Math.min(income, upperEarningsLimit) - primaryThreshold) * primaryRate;
    if (income > upperEarningsLimit) {
      ni += (income - upperEarningsLimit) * upperRate;
    }
  }
  console.log("National Insurance = £", ni);

  // Self-Employed National Insurance Calculation
  let eni = 0;
  if (income > primaryThreshold) {
    eni =
      (Math.min(income, upperEarningsLimit) - primaryThreshold) *
      selfPrimaryRate;
    if (income > upperEarningsLimit) {
      eni += (income - upperEarningsLimit) * selfUpperRate;
    }
  }
  console.log("Employed National Insurance = £", ni);
  console.log("Self-Employed National Insurance = £", eni);

  return NextResponse.json({
    income: income,
    incomeTax: totalIncomeTax,
    tax20: taxAt20Percent,
    tax40: taxAt40Percent,
    tax45: taxAt45Percent,
    nationalInsurance: ni,
    senationalInsurance: eni,
  });
}
