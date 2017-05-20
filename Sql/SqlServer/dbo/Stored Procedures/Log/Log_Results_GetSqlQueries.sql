-- =============================================
-- Author:		Mark Entingh
-- Create date: 12/9/2013 3:20 AM
-- Description:	
-- =============================================
CREATE PROCEDURE Log_Results_GetSqlQueries 
	@month int = 12,
	@year int = 2013
AS
BEGIN
	SET NOCOUNT ON;

    SELECT
	l.sqlqueries, count(*) as num, 
		(SELECT AVG(loadtime) FROM [Log] WHERE month(datecreated) = @month AND year(datecreated) = @year AND sqlqueries=l.sqlqueries) as avgtime 
	FROM [Log] l
	where MONTH(l.datecreated)=@month 
	group by sqlqueries
	order by num desc
END
